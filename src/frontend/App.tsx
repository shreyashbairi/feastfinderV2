import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

//Authenticator
import { AuthContextProvider } from './screens/UserComponents/Authorizer.tsx';

//screens
import Example from './screens/UserComponents/Example.tsx'
import Login from './screens/UserComponents/Login.tsx'
import RestPage from './screens/RestPageComponents/RestPage.tsx';
import SettingsNav from './screens/SettingsPages/SettingsNavComponents/SettingsNav.tsx';
import Home from './screens/HomeComponents/Home.tsx';
import SuggPage from "./screens/SettingsPages/SupportPages/SuggPage.tsx";
import RepBugPage from "./screens/SettingsPages/SupportPages/RepBugPage.tsx";
import AccountPage from "./screens/SettingsPages/AccountComponents/Account.tsx";
import SearchPage from './screens/SearchComponents/SearchPage.tsx';
import FAQPage from './screens/FAQComponents/FAQPage.tsx';
import Signup from './screens/UserComponents/SignUp.tsx';
import FollowUp from './screens/UserComponents/FollowUp.tsx';


function App(): JSX.Element {
  return (
    <AuthContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/account/login" element={<Login />} />
          <Route path="/account/signup" element={<Signup />}/>
          <Route path="/account/followup" element={<FollowUp />}/>
          <Route path="/Home" element={<Home />}/>
          <Route path="/Restaurant" element={<RestPage />}/>
          <Route path="/SettingsNavigation" element={<SettingsNav />}/>
          <Route path="/AccountPage" element={<AccountPage />}/>
          <Route path="/SuggestionPage" element={<SuggPage />}/>
          <Route path="/ReportBugPage" element={<RepBugPage />}/>
          <Route path="/Search" element={<SearchPage />}/>
          <Route path="/FAQPage" element={<FAQPage />}/>
        </Routes>
      </Router>
    </AuthContextProvider>
    
  );
}

export default App;