import React, { useEffect, useState } from "react"
import twitterLogo from "./assets/twitter-logo.svg"
import "./App.css"
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from "./utils/MyEpicGame.json";
import { ethers } from "ethers";
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';



const TWITTER_HANDLE = "web3dev_"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Esteja certo de ter instalado a Metamask antes de prosseguir!');
        setIsLoading(false);
        return;
      } else {
        console.log('Temos o objeto Ethereum', ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Foi encontrada a conta autorizada:', account);
          setCurrentAccount(account);
        } else {
          console.log('Nenhuma conta autorizada foi encontrada.');
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Abra a Metamask!');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Conectado!', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Conferindo os NFTS do endereço:', currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const characterNFT = await gameContract.checkIfUserHasNFT();
      if (characterNFT.name) {
        console.log('Usuário possui um NFT Mafioso');
        setCharacterNFT(transformCharacterData(characterNFT));
      }
      setIsLoading(false);
    };
  
    if (currentAccount) {
      console.log('Número da conta:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  const renderContent = () => {

    if(isLoading){
      return <LoadingIndicator/>
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://i.pinimg.com/originals/cb/a3/8c/cba38c53dd32b7025ef65ad7cd73eede.gif"
            alt="Cash suitcase"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Conecte sua Carteira para Continuar
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">🗡️ MAFIA WARS 🗡️</p>
          <p className="sub-text1">Il Capo Don Ferrucio colocou a cabeça de seus ex-matadores à venda após ser traído por eles.</p>
          <p className="sub-text2">Quem vencerá esta batalha?</p>
        </div>  
        <div className="connect-wallet-container">
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Feito na @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
