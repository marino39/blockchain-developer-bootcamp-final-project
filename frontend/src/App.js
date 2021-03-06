import React from "react"
import Web3 from 'web3'
import Web3Provider from 'web3-react'

import Landing from "./pages/Landing"
import MySurfaces from "./pages/MySurfaces";
import MyBids from "./pages/MyBids";
import Advertise from "./pages/Advertise";
import Surface from "./pages/Surface";
import SurfaceView from "./pages/SurfaceView";

import {BrowserRouter, Switch, Route} from "react-router-dom"
import {ChakraProvider, ColorModeScript} from "@chakra-ui/react"

import {Connectors} from 'web3-react'
import theme from "./theme";
import IsWalletConnected from "./utils/IsWalletConnected";

const {InjectedConnector} = Connectors

const MetaMask = new InjectedConnector({supportedNetworks: [3, 1337, 5777]})
const connectors = {MetaMask}

export default function App() {
  return (
      <ChakraProvider theme={theme} colorModeManager={"dark"}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode}/>
          <Web3Provider connectors={connectors} libraryName={'web3.js'} web3Api={Web3}>
              <BrowserRouter>
                  <Switch>
                      <Route exact path="/">
                          <Landing/>
                      </Route>
                      <Route path="/mySurfaces">
                          <IsWalletConnected>
                              <MySurfaces/>
                          </IsWalletConnected>
                      </Route>
                      <Route path="/myBids">
                          <IsWalletConnected>
                              <MyBids/>
                          </IsWalletConnected>
                      </Route>
                      <Route path="/advertise">
                          <IsWalletConnected>
                              <Advertise/>
                          </IsWalletConnected>
                      </Route>
                      <Route path="/surface/view/:id">
                          <IsWalletConnected>
                              <SurfaceView/>
                          </IsWalletConnected>
                      </Route>
                      <Route path="/surface/:id">
                          <IsWalletConnected>
                              <Surface/>
                          </IsWalletConnected>
                      </Route>
                  </Switch>
              </BrowserRouter>
          </Web3Provider>
      </ChakraProvider>
  )
}