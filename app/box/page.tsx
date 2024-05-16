"use client"

import React, { useEffect, useState } from "react";
import '@aws-amplify/ui-react/styles.css';
import {
    View, Flex, useTheme, Button, TextField
} from '@aws-amplify/ui-react';
import Folder from "../components/Folder";
import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// Itemの型を定義
interface Item {
    id: string;
    name: string;
    type: string;
}

const baseUrl = "https://account.box.com/api/oauth2/authorize";
//const domain = "http://localhost:3000";
const domain = "https://main.d134w93guui4w4.amplifyapp.com";
const redirectUri = domain + "/box";
const secretManagerUri = domain + '/api'

export default function Box() {
    const { tokens } = useTheme()

    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [id, setId] = useState('80269972749');
    const [errorMessage, setErrorMessage] = useState('');
    
    const fetchSecretManager = async () => {
        try {
            const response = await fetch(secretManagerUri, {
                method: 'POST',
                body: '',
            });
            const data = await response.json();
            // const _clientId = data.body.clientId
            // const _clientSecret = data.body.clientSecret
            if (data.statusCode === 200) {
                return data.body
            } else {
                console.log('Fetch api failure:', data);
                return
            }
        } catch (error) {
            console.error('<onSubmit> An error has occurred! ', error);
            return
        }
    }
    // AccessToken取得メソッド
    const fetchAccessToken = async (code:string) => {
        const responseBody = await fetchSecretManager()
        
        try {
            const response = await fetch("https://api.box.com/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    client_id: responseBody.clientId,
                    client_secret: responseBody.clientSecret,
                    redirect_uri: redirectUri,
                }),
            });
            const data = await response.json();
            console.log("Get New faccess_token", data.access_token)
            if (!data) {
                redirectBoxAuth(responseBody.clientId);
            }
            const newAccessToken = data.access_token;
            setAccessToken(newAccessToken);
            saveAccessTokenToStorage(newAccessToken); // アクセストークンを保存
        } catch (error) {
            console.log("get token error", error)
            return
        }
    };

    // AOuth2.0リダイレクト
    const redirectBoxAuth = async (clientId = '') => {
        if (!clientId) {
            const responseBody = await fetchSecretManager()
            clientId = responseBody.clientId
        }
        const authorizationUrl = `${baseUrl}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
        window.location.replace(authorizationUrl);
    }

    const saveAccessTokenToStorage = (accessToken:string) => {
        localStorage.setItem('accessToken', accessToken);
    };
    const getAccessTokenFromStorage = () => {
        return localStorage.getItem('accessToken');
    };

    useEffect(() => {
        const storedAccessToken = getAccessTokenFromStorage();
        if (storedAccessToken && storedAccessToken !== 'undefined') {
            setAccessToken(storedAccessToken);
        }
        else {
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");
            // Box認証ページからリダイレクトされた場合、パラメータにcodeが付与され、そのコードでトークンを取得する。
            if (code) {
                console.log("Fetch from Obtained code", code)
                fetchAccessToken(code);
            } else {
                // 初回アクセス時はBox認証ページへリダイレクト
                console.log("Not found code...")
                redirectBoxAuth();
            }
        }
    }, []);

    // ファイル取得ボタン
    const getFiles = async () => {
        const storedAccessToken = getAccessTokenFromStorage();
        if (!storedAccessToken || storedAccessToken === 'undefined') {
            setErrorMessage("Failed to obtain access token.");
            //redirectBoxAuth();
            return;
        }
        setAccessToken(storedAccessToken);

        // トークン切れ対応
        try {
            const response = await fetch(
                `https://api.box.com/2.0/folders/${id}/items`,
                {
                    headers: {
                        Authorization: `Bearer ${storedAccessToken}`,
                    },
                }
            );
            const data = await response.json();
            setItems(data.entries);
            console.log("Get items!", data.entries);
        } catch (error) {
            setErrorMessage("Access token expired.");
            //redirectBoxAuth();
            return;
        }
    };

    return (
        <>
            <div>
                <View
                    backgroundColor={tokens.colors.background.secondary}
                    padding={tokens.space.medium}
                    style={{ textAlign: 'left' }}
                >
                    <Flex direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        alignContent="flex-start"
                        wrap="nowrap"
                        gap="1rem"
                    >
                        <h1>作成書類一覧</h1>
                        <Flex direction="row">
                            <TextField
                                // descriptiveText="Boxフォルダのidを入力してください。"
                                label="Box ID"
                                value={id}
                                style={{ marginRight: '10px' }}
                                onChange={e => setId(e.target.value)}
                                errorMessage={errorMessage}
                                hasError
                            />
                            <Button onClick={() => getFiles()}>
                                最新のファイルを取得する
                            </Button>
                        </Flex>
                        {
                            accessToken && (
                                items.map((item) => (
                                    <Folder
                                        key={item.id}
                                        id={item.id}
                                        name={item.name}
                                        type={item.type}
                                        getFiles={getFiles}
                                        accessToken={accessToken}
                                    />
                                ))
                            )
                        }
                    </Flex>
                </View>
            </div>

        </>

    )
}
