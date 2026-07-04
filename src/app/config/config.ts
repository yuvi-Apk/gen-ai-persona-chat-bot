
// This function will makes sure thats .env is properly configured or not
function isDotEnvIsConfigured(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

// Object.freeze() ==> prevents unwanted mutation

export const config = Object.freeze({
    OPENAI_API_KEY: isDotEnvIsConfigured("OPENAI_API_KEY"),

    ACCESS_TOKEN_SECRET: isDotEnvIsConfigured("ACCESS_TOKEN_SECRET"),
    ACCESS_TOKEN_EXPIRY: isDotEnvIsConfigured("ACCESS_TOKEN_EXPIRY"),

    REFRESH_TOKEN_SECRET: isDotEnvIsConfigured("REFRESH_TOKEN_SECRET"),
    REFRESH_TOKEN_EXPIRY: isDotEnvIsConfigured("REFRESH_TOKEN_EXPIRY"),

});
