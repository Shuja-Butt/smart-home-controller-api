const config = {
    endpoint: "https://smarthomeuserdb.documents.azure.com:443/",
    key: "ge5Ytnql2elEiJiFASHSErB0vrKY8F6AUNHgKqOboFrhUtKmf4eNrxXop5WrfRHS35zKtCChnwYTkEuqHOZiFg==",
    databaseId: "smart-home-db",
    containerId: "devices",
    partitionKey: { kind: "Hash", paths: ["/category"] }
  };
  
  module.exports = config;