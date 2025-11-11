import api from '@actual-app/api';
import { Config } from './configs.js';


/** Runs the main actual budget data logic */
async function main() {
    // showConfigs();

    // Initalize actual budget connection
    await api.init({
        dataDir: Config.local.dataDir,
        serverURL: Config.actual.serverUrl,
        password: Config.actual.loginPassword,
        verbose: Config.actual.verbose
    });

    // Pull the actual budget data locally
    await api.downloadBudget(Config.actual.syncId, {
        password: Config.actual.e2eEncryptionPassword
    });

    // Perform logic with actual budget data
    let budget = await api.getBudgetMonth('2019-10');
    console.log(budget);

    // Close actual budget connection
    await api.shutdown();
}

main();
