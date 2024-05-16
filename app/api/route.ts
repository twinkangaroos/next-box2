import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// ■Routing: Route Handlers | Next.js
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
export const dynamic = 'force-dynamic' // defaults to auto
import { type NextRequest, NextResponse } from 'next/server'

const getSecretFromSecretsManager = async (secretName: string) => {
    const client = new SecretsManagerClient({ region: "ap-northeast-1" });

    try {
        const secretRes = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: "AWSCURRENT",
            })
        );

        const secret = secretRes.SecretString;
        const secretJson = secret ? JSON.parse(secret) : {};
        return secretJson;
    } catch (error) {
        console.error("Error fetching secret from Secrets Manager:", error);
        throw error;
    }
};

export async function GET(request: NextRequest) {
    try {
        const secretJson = await getSecretFromSecretsManager("BoxVerification");
        // console.log("secretJson.clientId", secretJson.clientId)
        // console.log("secretJson.clientSecret", secretJson.clientSecret)

        const response = {
            statusCode: 200,
            body: {
                "result": "0",
                "clientId": secretJson.clientId,
                "clientSecret": secretJson.clientSecret,
                "errorCode": ""
            }
        }
        return Response.json(response)
    }
    catch (err) {
        console.log("An error occured:", err)
        const response = {
            statusCode: 500,
            body: {
                "result": "1",
                "errorCode": "200"
            }
        }
        return Response.json(response)
    }
}

export async function POST(request: NextRequest) {
    try {
        const secretJson = await getSecretFromSecretsManager("BoxVerification");

        const response = {
            statusCode: 200,
            body: {
                "result": "0",
                "clientId": secretJson.clientId,
                "clientSecret": secretJson.clientSecret,
                "errorCode": ""
            }
        }
        return Response.json(response)
    }
    catch (err) {
        console.log("An error occured:", err)
        const response = {
            statusCode: 500,
            body: {
                "result": "1",
                "errorCode": "200"
            }
        }
        return Response.json(response)
    }
}

// ■How to Enable CORS on Vercel
// https://vercel.com/guides/how-to-enable-cors
// serverResponse.setHeader('Access-Control-Allow-Credentials', true)
// serverResponse.setHeader('Access-Control-Allow-Origin', '*')
// serverResponse.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
// serverResponse.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
// return;
// }
