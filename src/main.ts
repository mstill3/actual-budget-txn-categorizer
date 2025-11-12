import budgetApi from '@actual-app/api';
import { Config } from './configs.js';
import { queryLocalLLM } from './llm.js';
import type { APIAccountEntity, APICategoryEntity } from '@actual-app/api/@types/loot-core/src/server/api-models.js';
import type { TransactionEntity } from '@actual-app/api/@types/loot-core/src/types/models/index.js';


// See https://actualbudget.org/docs/api/reference

/**
 * Determine the most accuarate category for a given transaction
 * @param txn - Transaction to determine category for
 * @param possibleCategoryNames - category choices to pick from
 * @returns a promise of a category choice
 */
async function determineTxnCategory(txn: TransactionEntity, possibleCategoryNames: string[]): Promise<string> {
    let query = "Choose the best category from the following:\n";
    possibleCategoryNames.forEach((category) => {
        query += `- ${category}\n`;
    });

    query += `\nFor a given transaction:\n`
    query += `- Amount: $${Math.abs(txn.amount)}`;
    if (txn.imported_payee) {
        query += `\n- Payee: '${txn.imported_payee}'`;
    }
    if (txn.notes) {
        query += `\n- Note: '${txn.notes}'`;
    }
    query += "\n\nPlease provide only the selected option."

    console.log("\n=============\n  LLM Input\n=============\n");
    console.log(query + "\n");
    const llmResponse = await queryLocalLLM(query);
    console.log(">>> " + llmResponse + "\n");

    // Fix stange issue
    if (llmResponse === 'Accesories') {
        return 'Accessories';
    }

    return llmResponse;
}

/** Runs the main actual budget data logic */
async function main() {
    // showConfigs();

    // Initalize actual budget connection
    await budgetApi.init({
        dataDir: Config.actual.dataDir,
        serverURL: Config.actual.serverUrl,
        password: Config.actual.loginPassword,
        verbose: Config.actual.verbose
    });

    // Pull the actual budget data locally
    await budgetApi.downloadBudget(Config.actual.syncId, {
        password: Config.actual.e2eEncryptionPassword
    });

    // >>> Perform logic with actual budget data

    // 1. Fetch all categories
    const categories: APICategoryEntity[] = await budgetApi.getCategories();
    const categoryNames: string[] = categories.map((category) => category.name);
    /** Dictionary in order { categoryId: categoryName, } */
    const categoriesMap: Record<string, string> = Object.fromEntries(categories.map(category => [category.id, category.name.toLowerCase().trim()]));
    /** Dictionary in order { categoryName: categoryId, } */
    const categoriesReverseMap: Record<string, string> = Object.fromEntries(categories.map(category => [category.name.toLowerCase().trim(), category.id]));

    // 2. Fetch all accounts
    const accounts: APIAccountEntity[] = await budgetApi.getAccounts();
    for (const account of accounts) {
        // console.log(account.name);

        // 3. Fetch all txns per account
        const allTxnsForAccount: TransactionEntity[] = await budgetApi.getTransactions(account.id, "1900-01-01", `${new Date().getFullYear() + 1}-01-01`);
        for (const txn of allTxnsForAccount) {
            // console.log(txn);

            // 4. Determine if given txn needs category
            if (!txn.category) {
                // 5. Determine category for txn
                const chosenCategoryName = await determineTxnCategory(txn, categoryNames);

                // 6. Update the txn which the chosen category
                const chosenCategoryId = categoriesReverseMap[chosenCategoryName.toLowerCase().trim()];
        
                if (chosenCategoryId) {
                    // console.log(chosenCategoryName);
                    // console.log(chosenCategoryId);
                    await budgetApi.updateTransaction(txn.id, { category: chosenCategoryId });
                    console.log('Updated txn category');
                } else {
                    console.error('LLM chose text outside of options: ' + chosenCategoryName);
                }
            } else {
                // console.log(txn.category);
                if (txn.category in categoriesMap) {
                    // console.log(categoriesMap[txn.category.toLowerCase().trim()]);
                } else {
                    console.error("Unrecognized category");
                }
            }
        }
    }

    // Close actual budget connection
    await budgetApi.shutdown();
}

main();
