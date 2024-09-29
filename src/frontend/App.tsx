import React from 'react'
import {View, SafeAreaView} from 'react-native'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

//Navigation
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'



//screens
import Main from './screens/HomeComponents/Main.tsx'
import Example from './screens/UserComponents/Example.tsx'
import Login from './screens/UserComponents/Login.tsx'
import SignUp from './screens/UserComponents/SignUp.tsx'

export type RootStackParamList = {
  Home: undefined;
  RestPage: {rid: number, rName: string, color: string}
  SettingsNav: {uid: number}
  AccountPage: {uid: number}
  SuggPage: {uid: number}
  RepBPage: {uid: number}
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />}/>
        <Route path="/account/login" element={<Login />} />
        <Route path="/account/signup" element={<Example />}/>
      </Routes>
    </Router>
    
  );
}

export default App;