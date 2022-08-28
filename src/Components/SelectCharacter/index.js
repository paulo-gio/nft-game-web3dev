import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import LoadingIndicator from '../LoadingIndicator';


const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);

    const [mintingCharacter, setMintingCharacter] = useState(false);

    const mintCharacterNFTAction = (characterId) => async () => {
        try {
        if (gameContract) {
            setMintingCharacter(true);
            console.log('Cunhagem do Mafioso em andamento...');

            const mintTxn = await gameContract.mintCharacterNFT(characterId);
            await mintTxn.wait();
            console.log('mintTxn:', mintTxn);

            setMintingCharacter(false);
        }
        } catch (error) {
            console.warn('MintCharacterAction Error:', error);

            setMintingCharacter(false);
        }
    };

    useEffect(() => {
        const { ethereum } = window;
    
        if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gameContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            myEpicGame.abi,
            signer
        );
    
        setGameContract(gameContract);
        } else {
            console.log('Objeto Ethereum Não Encontrado');
        }
    }, []);

    useEffect(() => {
        const getCharacters = async () => {
            try {
                console.log('Buscando todos os mafiosos para a cunhagem');

                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log('charactersTxn:', charactersTxn);
        
                const characters = charactersTxn.map((characterData) =>
                transformCharacterData(characterData)
                );

                setCharacters(characters);
            } catch (error) {
                console.error('Alguma coisa deu errado na busca por mafiosos:', error);
            }
        };

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(
            `NFT Mafioso - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            );

            if (gameContract) {
            const characterNFT = await gameContract.checkIfUserHasNFT();
            console.log('NFT Mafioso: ', characterNFT);
            setCharacterNFT(transformCharacterData(characterNFT));
            }
            alert(`Seu NFT está pronto! Veja-o aqui: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`)
        };
    

        if (gameContract) {
            getCharacters();

            gameContract.on('CharacterNFTMinted', onCharacterMint);
        }

        return () => {

            if (gameContract) {
                gameContract.off('CharacterNFTMinted', onCharacterMint);
            }
        };
    }, [gameContract, setCharacterNFT]);

    const renderCharacters = () =>
    characters.map((character, index) => (
    <div className="character-item" key={character.name}>
        <div className="name-container">
        <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
        type="button"
        className="character-mint-button"
        onClick={mintCharacterNFTAction(index)}
        >{`Cunhar ${character.name}`}</button>
    </div>
    ));

    return (
        <div className="select-character-container">
            <h2>Faça a cunhagem de seu mafioso! Aja com cautela!</h2>
            {characters.length > 0 && (
                <div className="character-grid">{renderCharacters()}</div>
            )}
            {mintingCharacter && (
                <div className="loading">
                    <div className="indicator">
                        <LoadingIndicator />
                        <p>Cunhagem em progresso...</p>
                    </div>
                    <img
                        src="https://thumbs.gfycat.com/AjarDisguisedAfricanparadiseflycatcher-size_restricted.gif"
                        alt="Minting loading indicator"
                    />
                </div>
            )}
        </div>
    );
};

export default SelectCharacter;