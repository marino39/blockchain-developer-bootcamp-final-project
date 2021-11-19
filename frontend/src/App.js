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
import {ChakraProvider} from "@chakra-ui/react"

import {Connectors} from 'web3-react'

const {InjectedConnector} = Connectors

const MetaMask = new InjectedConnector({supportedNetworks: [1, 3, 4, 1337, 5777]})
const connectors = {MetaMask}

export default function App() {
  return (
      <ChakraProvider>
          <Web3Provider connectors={ connectors } libraryName={'web3.js'} web3Api={ Web3 }>
              <BrowserRouter>
              <Switch>
                <Route exact path="/">
                    <Landing/>
                </Route>
                  <Route path="/mySurfaces">
                      <MySurfaces/>
                  </Route>
                  <Route path="/myBids">
                      <MyBids/>
                  </Route>
                  <Route path="/advertise">
                      <Advertise/>
                  </Route>
                  <Route path="/surface/view/:id">
                      <SurfaceView/>
                  </Route>
                  <Route path="/surface/:id">
                      <Surface/>
                  </Route>
              </Switch>
            </BrowserRouter>
          </Web3Provider>
      </ChakraProvider>
  )
}