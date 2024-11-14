import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useAuth } from '../../UserComponents/Authorizer.tsx';
import { coreForm, ffColors } from '../../CoreComponents/CoreStyles.tsx';
import CoreButton from '../../CoreComponents/CoreButton.tsx';
import CorePopup from '../../CoreComponents/CorePopup.tsx';
import tw from 'twrnc';
import { API_BASE_URL } from '../../../../config.js';

export default function AccountLinkedAPIs() {
    
    // User Token
    const { user } = useAuth();

    // Boolean Account Links
    const [doordashLink, setDoordashLink] = React.useState(false);
    const [grubhubLink, setGrubhubLink] = React.useState(false);
    const [uberLink, setUberLink] = React.useState(false);

    // PopUp variables
    const [userValue, setuserValue] = React.useState('');
    const [passValue, setPassValue] = React.useState('');
    const [buttonService, setButtonService] = React.useState('Error Undefined')
    const [loginPop, setLoginPop] = React.useState(false);
    const [logoutPop, setLogoutPop] = React.useState(false);
    const [errPop, setErrPop] = React.useState(false)
    const [errText, setErrText] = React.useState('Error Undefined')

    const resetUserPass = () => {
        setuserValue('');
        setPassValue('');
    }

    const checkLogin = async (service: string) => {
        var fetchAddr = `${API_BASE_URL}/api/auth/app-status`
        
        try {
            const res = await fetch(fetchAddr, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : "Bearer " + user.token
                },
            });
            if (res.ok) {
                const data = await res.json();
                console.log("status check: ", data)
                switch (service) {
                    case "DoorDash":
                        setDoordashLink(data.doordash_logged_in);
                        break;
                    case "GrubHub":
                        setGrubhubLink(data.grubhub_logged_in);
                        break;
                    case "UberEats":
                        setUberLink(data.uber_logged_in);
                        break;
                    default:
                        console.error('switchFailure');
                        return;
                }
                //console.log("LoggedIn to "+ service + ": "+(isStored))
            } else {
                const errorData = await res.json();
                console.error('Error during login:', errorData);
            }
        } catch(error){
            console.error('Network error:', error);
        }
    }

    const getLinked = (service: string) => {
        checkLogin(service);
        var linked;
        switch (service) {
            case "DoorDash":
                linked = doordashLink
                break;
            case "GrubHub":
                linked = grubhubLink;
                break;
            case "UberEats":
                linked = uberLink;
                break;
            default:
                console.error('switchFailure');
                return;
        }
        if (linked) {
            return (
                <View
                style={styles.linkedContainer}
                >
                    <CoreButton
                    pressFunc={()=>{setButtonService(service); setLogoutPop(true)}}
                    bText={"Unlink Account"}
                    buttonColor={ffColors.ffGreyL}
                    />
                    <Text
                    style={[styles.serviceText, styles.text]}
                    >
                        {service + ": "} 
                    </Text>
                    <View>
                        <Text
                        style={[styles.textLinked, styles.text]}
                        >
                        Linked!
                        </Text>
                    </View>
                </View>
            )
        } else {
            return (
                <View
                style={styles.linkedContainer}
                >
                    <CoreButton
                    pressFunc={()=>{setButtonService(service); setLoginPop(true)}}
                    bText={"Link Account"}
                    buttonColor={ffColors.ffGreenL}
                    />
                    <Text
                    style={[styles.serviceText, styles.text]}
                    >
                        {service + ": "} 
                    </Text>
                    <View>
                        <Text
                        style={[styles.textUnlinked, styles.text]}
                        >
                        Not Linked
                        </Text>
                    </View>
                </View>
            )
        }
    }

    const popLoginHandler = async () => {
        console.log("Login Handler");
        if (!userValue) {
            setErrText("Username Blank");
            setErrPop(true);
            return;
        } else if (!passValue) {
            setErrText("Password Blank");
            setErrPop(true);
            return;
        }

        try {
            var response
            var fetchAddr = `${API_BASE_URL}/api/auth/app-login`
            response = await fetch(fetchAddr, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : "Bearer " + user.token
                },
                body: JSON.stringify({
                    email: userValue,
                    password: passValue,
                }),
            });
            
            
            const data = await response.json();

      
            if (!response.ok) {
                throw new Error(data.msg || 'Failed to register');
            }

            console.log('Registration successful:', data);

            switch (buttonService) {
                case "DoorDash":
                    localStorage.setItem("doordash_token", data.token);
                    break;
                case "GrubHub":
                    localStorage.setItem("grubhub_token", data.token);
                    break;
                case "UberEats":
                    localStorage.setItem("ubereats_token", data.token);
                    break;
                default:
                    console.error('switchFailure');
                    return;
            }

            setLoginPop(false); 
            setButtonService('Error Undefined');
            resetUserPass();
        } catch (err) {
            setErrText(err.message);
            setErrPop(true);
        }
    }

    const popLogoutHandler = async () => {
        try {
            var fetchAddr = `${API_BASE_URL}/api/auth/app-logout`
            var app_token;
            
            switch (buttonService) {
                case "DoorDash":
                    app_token = localStorage.getItem('doordash_token');
                    break;
                case "GrubHub":
                    app_token = localStorage.getItem('grubhub_token');
                    break;
                case "UberEats":
                    app_token = localStorage.getItem('ubereats_token');
                    break;
                default:
                    console.error('switchFailure');
                    setErrText("Internal Service Error\nDelivery Service not recognized");
                    setErrPop(true);
                    return;
            }
            if (!app_token) {
                throw new Error("Can't find token for, " + buttonService);
            }
            const response = await fetch(fetchAddr, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : "Bearer " + app_token
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to register');
            }

            console.log('Registration successful:', data);
            setLogoutPop(false); 
            setButtonService('Error Undefined');
        } catch (err) {
            setErrText(err.message);
            setErrPop(true);
        }
    }
  
    return (
        <View>
            <Text style={tw.style(coreForm.subheader)}>
                Linked Accounts:
            </Text>
            <View style={[tw.style(coreForm.body), ]}>
                {getLinked("DoorDash")}
                {getLinked("GrubHub")}
                {getLinked("UberEats")}
            </View>

            <CorePopup 
            popTitle={'Enter ' + buttonService + ' Login to Link Account:'}
            popText={""}
            closeFunc={()=>{setLoginPop(false); setButtonService('Error Undefined'); resetUserPass();}}
            pop={loginPop}
            titleColor={ffColors.ffGreenL}
            buttons={[
                {
                    bText: 'Submit',
                    bColor: ffColors.ffGreenL,
                    bFunc: ()=>{popLoginHandler()}
                },
                {
                    bText: 'Close',
                    bColor: ffColors.ffRedL,
                    bFunc: ()=>{setLoginPop(false); setButtonService('Error Undefined'); resetUserPass()}
                }
            ]}
            >
                <View
                style={styles.loginContainer}
                >
                    <Text
                    style={styles.popupText}
                    >
                        Login:
                    </Text>
                    <input
                    type='text'
                    style={styles.popInput}
                    onChange={(event)=>{setuserValue(event.target.value)}}
                    value = {userValue}
                    placeholder='Username...'
                    />
                    <input
                    type='password'
                    style={styles.popInput}
                    onChange={(event)=>{setPassValue(event.target.value)}}
                    value = {passValue}
                    placeholder='Password...'
                    />
                </View>
            </CorePopup>

            <CorePopup 
            popTitle={'Confirm unlink '+buttonService+' Account:'}
            popText={""}
            closeFunc={()=>{setLogoutPop(false); setButtonService('Error Undefined')}}
            pop={logoutPop}
            titleColor={ffColors.ffRedL}
            buttons={[
                {
                    bText: 'Confirm',
                    bColor: ffColors.ffGreenL,
                    bFunc: ()=>{popLogoutHandler()}
                },
                {
                    bText: 'Cancel',
                    bColor: ffColors.ffRedL,
                    bFunc: ()=>{setLogoutPop(false); setButtonService('Error Undefined')}
                }
            ]}
            />

            <CorePopup 
            popTitle={'Error:'}
            popText={errText}
            closeFunc={()=>{setErrPop(false); setErrText('Error Undefined')}}
            pop={errPop}
            titleColor={ffColors.ffRedL}
            buttons={[
                {
                    bText: 'Close',
                    bColor: ffColors.ffRedL,
                    bFunc: ()=>{setErrPop(false); setErrText('Error Undefined')}
                }
            ]}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    //Linked Account Styles
    textLinked: {
        color: ffColors.ffGreenL,
    },
    textUnlinked: {
        color: ffColors.ffRedL,
    },
    text: {
        
    },
    linkedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceText: {
        fontWeight: 'bold',
    },
    popupText: {
        marginBottom: 10,
        fontSize: 15,
        fontWeight: 'bold',
    },
    popInput:{
        height: 'auto',
        marginBottom: 20,
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
    },
    loginContainer: {
        margin: 20,
        marginTop:0,
    },
})