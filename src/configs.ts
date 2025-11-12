export const Config = {
    actual: {
        /** budget data will be cached locally here, in subdirectories for each file */
        dataDir: process.env.DATA_DIR!,
        /** end-to-end encryption file password */
        e2eEncryptionPassword: process.env.E2E_ENCRYPTION_PASSWORD!,
        /** the password you use to log into the server */
        loginPassword: process.env.LOGIN_PASSWORD!,
        /** the URL of your running server */
        serverUrl: process.env.SERVER_URL!,
        /** ID from Settings → Show advanced settings → Sync ID */
        syncId: process.env.SYNC_ID!,
        /** verbose output */
        verbose: (process.env.VERBOSE || 'false').toLowerCase() === 'true',
    },
    llm: {
        endpoint: process.env.LLM_ENDPOINT!,
        model: process.env.LLM_MODEL!
    }
} as const;


/** Displays all the app-specific environment variables to the console */
export function showConfigs() {
    console.log("========================\n Configs\n---------------------");
    (Object.keys(Config) as Array<keyof typeof Config>).forEach(key => {
        const configSection = Config[key];
        
        Object.entries(configSection).forEach(([subKey, value]) => {
            console.log(`- ${subKey}: ${value}`);
        });
    });
    console.log();
}
