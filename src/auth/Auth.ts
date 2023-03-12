import { Request } from "express";

import axios from "axios";
import * as jwt from "jsonwebtoken";
import * as jwkToPem from "jwk-to-pem";

import { UnauthorizedException } from "@nestjs/common";

const userPoolId = "us-east-2_F4SRmE4RG";

const superAdmins = ["shorupan@gmail.com", "manichandra.teja@gmail.com"];

interface decodeResult {
  status: boolean;
  email: string;
  message: string;
}

const decodeToken = async (token) => {
  return new Promise(async (resolve) => {
    try {
      axios
        .get(
          `https://cognito-idp.us-east-2.amazonaws.com/${userPoolId}/.well-known/jwks.json `,
        )
        .then((keys) => {
          try {
            const jwk = keys.data.keys[0];
            const pem = jwkToPem(jwk);
            jwt.verify(token, pem, function (err, decoded) {
              if (err) return resolve({ status: false, message: err.message });

              console.log(decoded.email);

              return resolve({
                status: true,
                email: decoded.email,
                message: "Token Valid!",
              });
            });
          } catch (e) {
            console.log("CATCH");
            resolve({ status: false, message: e.message });
            return;
          }
        });
    } catch (e) {
      return resolve({
        status: false,
        message: e.message,
      });
    }
  });
};

export const UserAuth = async (req: Request): Promise<boolean> => {
  console.log("User Token here.... in authentication..");

  const token = req.headers["token"];
  const email = req.headers["email"];

  console.log("Email auth from header...", email);

  const decode = (await decodeToken(token)) as decodeResult;

  if (!decode.status)
    throw new UnauthorizedException({
      message: "Auth Error: " + decode.message,
      login: true,
    });

  const decodedEmail = decode.email;

  if (email === decodedEmail) {
    console.log("User Token is given");
  } else if (superAdmins.includes(decodedEmail)) {
    console.log("Super Admin email token is given");
    req.body.decodedTokenEmail = decodedEmail;
    req.body.superAdmin = true;
  } else {
    throw new UnauthorizedException({
      message: "Auth Error: Token not valid!",
      login: true,
    });
  }

  req.body.email = email;
  req.query.email = email;
  req.body.decodedTokenEmail = decodedEmail;
  return true;
};

// SuperAdmin
export const AdminAuth = async (req: Request): Promise<boolean> => {
  const token = req.headers["token"];
  if (!token) throw new UnauthorizedException("Token not given!");

  const decode = (await decodeToken(token)) as decodeResult;
  if (!decode.status)
    throw new UnauthorizedException({
      message: "Auth Error: " + decode.message,
      login: true,
    });

  const email = decode.email;

  if (!superAdmins.includes(email)) {
    throw new UnauthorizedException({ message: "Access Denied!" });
  }

  req.body.email = email;
  req.query.email = email;
  req.body.decodedTokenEmail = email;
  req.body.superAdmin = true;

  return true;
};
