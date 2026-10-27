import express, { Application, NextFunction, Response, Request } from 'express';
import router from "@/api/routes";

export class Server {
    private app: Application = express();

    constructor() {
        this.app.use(express.json());
        this.Router();
    }

    public Listen = (port: number | string, callback: () => void) => this.app.listen(port, callback);

    private Router = () => {
        this.app.use(router)
    }
}
