import React from "react"
import Web3 from 'web3'
import Web3Provider from 'web3-react'

import Landing from "./pages/Landing"

import { BrowserRouter, Switch, Route } from "react-router-dom"
import { ChakraProvider } from "@chakra-ui/react"

import { Connectors } from 'web3-react'
const { InjectedConnector } = Connectors

const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4, 5777] })
const connectors = { MetaMask }

export default function App() {
  return (
      <ChakraProvider>
          <Web3Provider connectors={ connectors } libraryName={'web3.js'} web3Api={ Web3 }>
              <BrowserRouter>
              <Switch>
                <Route path="/">
                  <Landing />
                </Route>
              </Switch>
            </BrowserRouter>
          </Web3Provider>
      </ChakraProvider>
  )
}