import React, { useState } from 'react';
import '@aws-amplify/ui-react/styles.css';
import {
    View, Flex, Link
} from '@aws-amplify/ui-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
import { faFolder, faFile, faFolderOpen } from '@fortawesome/free-regular-svg-icons';

interface FolderProps {
    id: string;
    name: string;
    type: string;
    getFiles: (paramId?: string | null) => Promise<void>;
    accessToken: string;
}
  
// const Folder = ({ id, name, type, getFiles, accessToken }) => {
const Folder: React.FC<FolderProps> = ({ id, name, type, getFiles, accessToken }) => {
    const [expanded, setExpanded] = useState(false);
    const [subFolders, setSubFolders] = useState<FolderProps[]>([]);

    const toggleExpand = async () => {
        if (type !== 'folder') {
            return;
        }
        setExpanded(!expanded);
        if (!expanded) {
            const response = await fetch(`https://api.box.com/2.0/folders/${id}/items`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            //const folders = data.entries.filter((item) => item.type === 'folder');
            const folders = data.entries;
            setSubFolders(folders);
        } else {
            setSubFolders([]);
        }
    };

    const downloadFile = async () => {
        const response = await fetch(`https://api.box.com/2.0/files/${id}/content`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <Flex style={{ display: 'flex', alignItems: 'center' }}>
                <Flex onClick={toggleExpand} style={{ cursor: type === 'folder' ? 'pointer': '' }} alignItems={'center'}>
                    {/* 📂 */}
                    {
                        type === 'folder' ?
                            <FontAwesomeIcon icon={expanded ? faFolderOpen : faFolder} />
                            :
                            <FontAwesomeIcon icon={faFile} />
                    }
                    {name}
                    
                </Flex>
                {
                    type === 'folder' && (
                        <>
                            <Link href="#" color="#007EB9" fontSize={"12px"}>
                                <FontAwesomeIcon icon={faFileArrowDown} /> 参考書式
                            </Link>
                            <Link href="#" color="#007EB9" fontSize={"12px"}>
                                <FontAwesomeIcon icon={faFileArrowDown} /> 支店（社）資料
                            </Link>
                            <Link href="#" color="#007EB9" fontSize={"12px"}>
                                <FontAwesomeIcon icon={faArrowUpFromBracket} /> Upload
                            </Link>
                        </>
                    )
                }
                {
                    type === 'file' && (
                        <Flex>
                            <Link href="#" color="#007EB9" onClick={downloadFile}>
                                <FontAwesomeIcon icon={faFileArrowDown} />
                            </Link>
                        </Flex>
                    )
                }
            </Flex>

            {expanded && (
                <View marginLeft="1rem" marginBottom="0.5rem">
                    {subFolders.map((folder) => (
                        <View marginBottom="0.5rem" marginTop="0.5rem" key={folder.id}>
                            <Folder
                                key={folder.id}
                                id={folder.id}
                                name={folder.name}
                                type={folder.type}
                                getFiles={getFiles}
                                accessToken={accessToken}
                            />
                        </View>
                    ))}
                </View>
            )}
        </div>
    );
};

export default Folder
