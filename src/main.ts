import api from '@actual-app/api';
import { Config } from './configs.js';


async function setup() {
    await api.init({
        dataDir: Config.local.dataDir,
        serverURL: Config.actual.serverUrl,
        password: Config.actual.loginPassword,
    });

    await api.downloadBudget(Config.actual.syncId, {
        password: Config.actual.e2eEncryptionPassword,
    });
}

async function main() {
    await setup();

    let budget = await api.getBudgetMonth('2019-10');
    console.log(budget);

    await api.shutdown();
}

main();
