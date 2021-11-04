import React from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import { ChakraProvider } from "@chakra-ui/react"

import Landing from "./pages/Landing"

export default function App() {
  return (
      <ChakraProvider>
        <BrowserRouter>
          <Switch>
            <Route path="/">
              <Landing />
            </Route>
          </Switch>
        </BrowserRouter>
      </ChakraProvider>
  )
}