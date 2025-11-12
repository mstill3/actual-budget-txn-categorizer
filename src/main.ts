// See https://actualbudget.org/docs/api/reference
import budgetApi from '@actual-app/api';
import { Config } from './configs.js';
import type { APIAccountEntity, APICategoryEntity } from '@actual-app/api/@types/loot-core/src/server/api-models.js';
import type { TransactionEntity } from '@actual-app/api/@types/loot-core/src/types/models/index.js';

/** In format '2019-08-20' */
// type DateStr = string;

// async function getTransactions(accountId: string, startDate: DateStr, endDate: DateStr) {
//     return await budgetApi.getTransactions(accountId, startDate, endDate);
// }

async function determineTxnCategory(txn: TransactionEntity, possibleCategoryNames: string[]) {
    console.log("TODO: Determine category name for txn");
    console.log({
        txn,
        possibleCategoryNames
    });
    const chosenCategoryName = "dsdsdsds";
    return chosenCategoryName;
}

/** Runs the main actual budget data logic */
async function main() {
    // showConfigs();

    // Initalize actual budget connection
    await budgetApi.init({
        dataDir: Config.local.dataDir,
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
    const categoriesMap: Record<string, string> = Object.fromEntries(categories.map(category => [category.id, category.name]));
    /** Dictionary in order { categoryName: categoryId, } */
    const categoriesReverseMap: Record<string, string> = Object.fromEntries(categories.map(category => [category.name, category.id]));

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
                const chosenCategoryId = categoriesReverseMap[chosenCategoryName];
                console.log(chosenCategoryName);
                console.log(chosenCategoryId);
                await budgetApi.updateTransaction(txn.id, { category: chosenCategoryId });

                return;
            } else {
                // console.log(txn.category);
                if (txn.category in categoriesMap) {
                    // console.log(categoriesMap[txn.category]);
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
