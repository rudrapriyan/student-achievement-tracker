// config/db.js
// Handles connection and initialization for Azure Cosmos DB.

const { CosmosClient } = require("@azure/cosmos");

// --- Configuration ---
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE_ID;
const containerId = process.env.COSMOS_CONTAINER_ID;
const partitionKey = { paths: ["/id"] }; // Define the partition key

// --- Singleton Instances ---
// Create a single, shared client instance.
const client = new CosmosClient({ endpoint, key });
// Create references to the database and container.
const database = client.database(databaseId);
const container = database.container(containerId);

/**
 * Initializes the database and container, creating them if they don't exist.
 * This function should be called once on server startup.
 */
const initializeDatabase = async () => {
    try {
        console.log(`Ensuring database '${databaseId}' exists...`);
        const { database: db } = await client.databases.createIfNotExists({ id: databaseId });
        console.log(`Database '${db.id}' is ready.`);

        console.log(`Ensuring container '${containerId}' exists...`);
        const { container: cont } = await db.containers.createIfNotExists({
            id: containerId,
            partitionKey: partitionKey
        });
        console.log(`Container '${cont.id}' is ready.`);
        console.log("Cosmos DB initialized successfully.");
    } catch (error) {
        console.error("Fatal error during Cosmos DB initialization:", error);
        throw error; // Re-throw the error to prevent the server from starting
    }
};

/**
 * A getter function to provide access to the shared container instance.
 * @returns {Container} The Cosmos DB container object.
 */
const getContainer = () => {
    return container;
};

// Export the necessary functions
module.exports = {
    initializeDatabase,
    getContainer
};

