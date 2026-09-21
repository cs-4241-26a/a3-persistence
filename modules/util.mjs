import { loadEnvFile } from "node:process";

export class ServerData {
    /**
     * @param {number} port 
     * @param {string} user 
     * @param {string} pass 
     * @param {string} host 
     * */ 
    constructor(port, user, pass, host) {
        this.port = port;
        this.user = user;
        this.pass = pass; 
        this.host = host;
    }
} 

export function setup() {
    // load environment variables from .env file
    loadEnvFile();

    return new ServerData(
        process.env.PORT ?? 3000, // defaults to 3000 if port is undefined or null
        process.env.USER, 
        process.env.PASS,
        process.env.HOST
    ); 
}