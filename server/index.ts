import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import hpp from "hpp";
import helmet from "helmet";
import session from "express-session";
import cors from "cors";
import compression from "compression";
import jwt from "jsonwebtoken"
class Error404 extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = 404;
  }
}

const $session = session({
  secret: "783f01ae9fb7775fca7716279dfb5df8d95b6e84c8e8b9874ef67f3a7f3123c4",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 3600000,
  },
});

const app = express();

// 1. Capeceras de seguridad y optimización básicas
app.use(helmet());
app.use(cors());
app.use(compression());

// 2. PARSERS (Obligatorios aquí para crear los objetos req.body y req.query)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 3. SANITIZADORES (¡Muévelos aquí abajo!)
// Ahora que los parsers hicieron su trabajo, estos middlewares pueden modificar req.body y req.query sin romper nada
app.use(hpp()); 

// 4. Sesión y Logs
app.use($session);
app.use(morgan("dev"));

app.get("/signup", (req: express.Request, res: express.Response) => {
  res.json({
    ok: true,
    status: 200,
  });
});

app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error404 = new Error404("Route doesnt found. 404");
  next(error404);
});

app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (error: Error404, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(error);

    res.status(error.status ?? 500).json({
      status: error.status,
      ok: false,
      data: error.message,
    });
  },
);

app.listen(4000, ()=>{
  console.log("Server listenning on port 4000")
})