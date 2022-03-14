const config = {
    endpoint: "https://smarthomeuserdb.documents.azure.com:443/",
    key: "",
    databaseId: "smart-home-db",
    containerId: "devices",
    partitionKey: { kind: "Hash", paths: ["/category"] }
  };
  
  module.exports = config;
