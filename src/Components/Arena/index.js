import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from "../../Components/LoadingIndicator";


const Arena = ({ characterNFT, setCharacterNFT }) => {

    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState('');
    const [showToast, setShowToast] = useState(false);

    const runAttackAction = async () => {
        try {
            if (gameContract) {
                setAttackState('atacando...');
                console.log('Atacando Il Capo...');
                const attackTxn = await gameContract.attackBoss();
                await attackTxn.wait();
                console.log('attackTxn:', attackTxn);
                setAttackState('hit');
                setShowToast(true);
                setTimeout(() => {
                  setShowToast(false);
                }, 5000); 
            }
          } catch (error) {
            console.error('Erro ao atacar Il Capo:', error);
            setAttackState('');
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
        console.log('Objeto Ethereum não encontrado');
        }
    }, []);
    useEffect(() => {
        
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            console.log('IL CAPO:', bossTxn);
            setBoss(transformCharacterData(bossTxn));
        };

        const onAttackComplete = (from, newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp.toNumber();

            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

            setBoss((prevState) => {
                return { ...prevState, hp: bossHp };
            });

            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp };
            });
        };
      
        if (gameContract) {
            fetchBoss();
            gameContract.on('AttackComplete', onAttackComplete);
        }
        return () => {
            if (gameContract) {
                gameContract.off('AttackComplete', onAttackComplete);
            }
        }
    }, [gameContract, setCharacterNFT]);

    return (
        <div className="arena-container">
            {boss && characterNFT && (
                <div id="toast" className={showToast ? 'show' : ''}>
                    <div id="desc">{`💥 ${boss.name} teve um dano de ${characterNFT.attackDamage}!`}</div>
                </div>
            )} 
            {boss && (
                <div className="boss-container">
                    <div className={`boss-content ${attackState}`}>
                        <h2>🔥 {boss.name} 🔥</h2>
                        <div className="image-content">
                            <img src={boss.imageURI} alt={`IL CAPO ${boss.name}`} />
                            <div className="health-bar">
                                <progress value={boss.hp} max={boss.maxHp} />
                                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                            </div>
                        </div>
                    </div>
                    <div className="attack-container">
                        <button className="cta-button" onClick={runAttackAction}>
                        {`💥 ATAQUE ${boss.name}`}
                        </button>
                    </div>
                    {attackState === 'attacking' && (
                        <div className="loading-indicator">
                            <LoadingIndicator />
                            <p>Atacando ⚔️</p>
                        </div>
                    )}
                </div>
            )}
            {characterNFT && (
            <div className="players-container">
                <div className="player-container">
                    <div className="player">
                        <div className="image-content">
                            <h2>⚔️ {characterNFT.name} ⚔️</h2>
                            <img
                                src={characterNFT.imageURI}
                                alt={`MAFIOSO ${characterNFT.name}`}
                            />
                            <div className="health-bar">
                                <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                                <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                            </div>
                        </div>
                        <div className="stats">
                            <h4>{`⚔️ Dano de Ataque: ${characterNFT.attackDamage}`}</h4>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default Arena;