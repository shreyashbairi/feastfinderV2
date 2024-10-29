
import React from 'react'

import { 
    SafeAreaView,
    ScrollView, 
    StyleSheet,
    Text, 
    Image,
    View,
} from 'react-native'

import { useAuth } from '../UserComponents/Authorizer.tsx';

import { ffColors } from '../CoreComponents/CoreStyles.tsx';

// navigation
import { useLocation, useNavigate } from 'react-router-dom';
import CorePopup from '../CoreComponents/CorePopup.tsx';
import CoreButton from '../CoreComponents/CoreButton.tsx';
import { Restaurant } from '../CoreComponents/CoreTypes.tsx';

export default function SearchCards() {

    const navigate = useNavigate();
    const location = useLocation();
    const { results = [], searchType, search, deliveryService, errorText } = location.state;

    const [userValue, setuserValue] = React.useState('');
    const [passValue, setPassValue] = React.useState('');
    const [errPop, setErrPop] = React.useState(false)
    const [errText, setErrText] = React.useState('Error Undefined')
    const [loginPop, setLoginPop] = React.useState(false)
    const [buttonService, setButtonService] = React.useState('Error Undefined')
    const [holdItem, setHoldItem] = React.useState(null);
    const { user } = useAuth();

    // Function to filter items based on the selected delivery service
    const filterBySelectedService = (item) => {
        if (deliveryService === 'UberEats') return item.ubereatsAvailable;
        if (deliveryService === 'Grubhub') return item.grubhubAvailable;
        if (deliveryService === 'DoorDash') return item.doordashAvailable;
        return true; // If no specific service is selected, return all items
    };

    // Filter results based on the selected delivery service availability
    const filteredResults = results.filter(filterBySelectedService);

    const resetUserPass = () => {
        setuserValue('');
        setPassValue('');
    }

    const popSubmitHandler = async () => {
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
            let response;
            let fetchAddr = 'http://localhost:5001/api/auth/';
            switch (buttonService) {
                case "DoorDash":
                    fetchAddr += 'doordashlogin';
                    response = await fetch(fetchAddr, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization' : "Bearer " + user.token
                        },
                        body: JSON.stringify({
                            doordash_email: userValue,
                            doordash_password: passValue,
                        }),
                    });
                    break;
                case "GrubHub":
                    fetchAddr += 'grubhublogin';
                    response = await fetch(fetchAddr, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization' : "Bearer " + user.token
                        },
                        body: JSON.stringify({
                            grubhub_email: userValue,
                            grubhub_password: passValue,
                        }),
                    });
                    break;
                case "UberEats":
                    fetchAddr += 'uberlogin';
                    response = await fetch(fetchAddr, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization' : "Bearer " + user.token
                        },
                        body: JSON.stringify({
                            uber_email: userValue,
                            uber_password: passValue,
                        }),
                    });
                    break;
                default:
                    console.error('switchFailure');
                    setErrText("Internal Service Error\nDelivery Service not recognized");
                    setErrPop(true);
                    return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to register');
            }

            console.log('Registration successful:', data);
            setLoginPop(false); 
            setButtonService('Error Undefined');
            resetUserPass();
            navigate('/restaurant', {state: {restaurant: holdItem, service: buttonService}})
        } catch (err) {
            setErrText(err.message);
            setErrPop(true);
        }
    }

    const checkLogin = async (service: string, item) => {
        let fetchAddr = 'http://localhost:5001/api/auth/';
        switch (service) {
            case "DoorDash":
                fetchAddr += 'doordash';
                break;
            case "GrubHub":
                fetchAddr += 'grubhub';
                break;
            case "UberEats":
                fetchAddr += 'uber';
                break;
            default:
                console.error('switchFailure');
                setErrText("Internal Service Error\nDelivery Service not recognized");
                setErrPop(true);
                return;
        }
        fetchAddr += 'login/status';
        
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
                let isStored;
                switch (service) {
                    case "DoorDash":
                        isStored = data.doordash_stored;
                        break;
                    case "GrubHub":
                        isStored = data.grubhub_stored;
                        break;
                    case "UberEats":
                        isStored = data.uber_stored;
                        break;
                    default:
                        console.error('switchFailure');
                        setErrText("Internal Service Error\nDelivery Service not recognized");
                        setErrPop(true);
                        return;
                }

                console.log("LoggedIn " + isStored);
                if (isStored) {
                    console.log('fetch: Successful');
                    navigate('/restaurant', {state: {restaurant: item, service: service}})
                } else {
                    setHoldItem(item);
                    setButtonService(service);
                    setLoginPop(true);
                }
            } else {
                const errorData = await res.json();
                console.error('Error during login:', errorData);
                setErrText(errorData.msg);
                setErrPop(true);  // Set error state on failure
            }
        } catch(error){
            console.error('Network error:', error);
            setErrText("Network error\nCheck internet connection");
            setErrPop(true);  // Handle network error
        }
    }

    const APIButton = (service: string, available: boolean, item) => {
        if (available) {
            return (
                <CoreButton
                    pressFunc={() => {checkLogin(service, item)}}
                    bText={service}
                    buttonColor={ffColors.ffGreenL}
                />
            )
        } else {
            return (
                <View style={styles.buttonDeactive}>
                    <Text style={styles.buttonTextDeactive}>
                        {service}
                    </Text>
                </View>
            )
        }
    }

    const restItem = (item: Restaurant, index: number) => {
        return (
            <View
                key={item.restaurantID}
                style={styles.card}
            >
                <Image 
                    source={{ uri: item.restaurantImage ? String(item.restaurantImage) : '/images/testRest.png' }}
                    style={styles.cardImage}
                    resizeMode="contain"
                />
                <View style={styles.cardContent}>
                    <Text
                        numberOfLines={1}
                        style={styles.restaurantName}
                    >
                        {item.restaurantName}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={styles.cardDetails}
                    >
                        Distance: {item.distance.toString()} Miles
                    </Text>
                    <Text 
                        numberOfLines={1}
                        style={styles.cardDetails}
                    >
                        Address: {item.restaurantAddress}
                    </Text>
                    <Text 
                        numberOfLines={5}
                        style={styles.cardDetails}
                    >
                        Description: {item.restaurantName + ' Description...'}
                    </Text>
                </View>
                <View style={styles.buttonContent}>
                    {APIButton("DoorDash", item.doordashAvailable, item)}
                    {APIButton("GrubHub", item.grubhubAvailable, item)}
                    {APIButton("UberEats", item.ubereatsAvailable, item)}
                </View>
            </View>
        )
    }

    const goToDishRestaurants = async (dishName) => {
        try {
            const response = await fetch(`http://localhost:5001/api/searchRestaurant?dish=${encodeURIComponent(dishName)}`);
            if (response.ok) {
                const restaurantResults = await response.json();
                navigate('/Search', {
                    state: {
                        search: dishName,
                        results: restaurantResults,
                        searchType: 'restaurant',
                        deliveryService,
                    }
                });
            } else {
                console.log('No restaurants found for dish:', dishName);
                navigate('/Search', {
                    state: {
                        search: dishName,
                        results: [],
                        searchType: 'restaurant',
                        deliveryService,
                        errorText: 'No results found'
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            navigate('/Search', {
                state: {
                    search: dishName,
                    results: [],
                    searchType: 'restaurant',
                    deliveryService,
                    errorText: 'Error fetching restaurants'
                }
            });
        }
    };
    


    const dishItem = (item, index) => {
        return (
            <View
                key={index}
                style={styles.card}
            >
                <Image 
                    source={{ uri: item.image ? String(item.image) : '/images/default_dish.png' }}
                    style={styles.cardImage}
                    resizeMode="contain"
                />
                <View style={styles.cardContent}>
                    <Text
                        numberOfLines={1}
                        style={styles.dishName}
                    >
                        {item.dishName}
                    </Text>
                    <Text 
                        numberOfLines={1}
                        style={styles.cardDetails}
                    >
                    Available at: {item.restaurantNames[0]}
                    </Text>
                </View>
                <View style={styles.buttonContent}>
                    <CoreButton
                        pressFunc={() => goToDishRestaurants(item.dishName)}
                        bText="View Restaurants"
                        buttonColor={ffColors.ffGreenL}
                    />
                </View>
            </View>
        )
    }
    //-----Main Render-----
    return (
        <SafeAreaView>
            <View style={styles.container}>
                {filteredResults.length > 0 ? (
                    searchType === 'restaurant' ? (
                        filteredResults.map((item, index) => restItem(item, index))
                    ) : (
                        filteredResults.map((item, index) => dishItem(item, index))
                    )
                ) : (
                    <View style={styles.errorPage}>
                        <Text style={styles.errorMessage}>
                            {errorText || `No results found for ${deliveryService || 'all services'}.`}
                        </Text>
                    </View>
                )}
            </View>

            {/* Error Popup */}
            <CorePopup
                pop={errPop}
                popTitle={"Error:"}
                popText={errText}
                closeFunc={()=>{setErrPop(false); setErrText('Error Undefined')}}
                titleColor={ffColors.ffRedL}
                buttons={[
                    {
                        bText: 'Close',
                        bColor: ffColors.ffRedL,
                        bFunc: ()=>{setErrPop(false); setErrText('Error Undefined')}
                    }
                ]}
            />

            {/* Login Popup */}
            <CorePopup 
                popTitle={'Not logged into ' + buttonService + ':'}
                popText={""}
                closeFunc={()=>{setLoginPop(false); setButtonService('Error Undefined'); resetUserPass();}}
                pop={loginPop}
                titleColor={ffColors.ffRedL}
                buttons={[
                    {
                        bText: 'Submit',
                        bColor: ffColors.ffGreenL,
                        bFunc: ()=>{popSubmitHandler()}
                    },
                    {
                        bText: 'Close',
                        bColor: ffColors.ffRedL,
                        bFunc: ()=>{setLoginPop(false); setButtonService('Error Undefined'); resetUserPass()}
                    }
                ]}
            >
                <View style={styles.loginContainer}>
                    <Text style={styles.popupText}>
                        Login:
                    </Text>
                    <input
                        style={styles.popInput}
                        onChange={(event)=>{setuserValue(event.target.value)}}
                        value={userValue}
                        placeholder='Username...'
                    />
                    <input
                        type="password"
                        style={styles.popInput}
                        onChange={(event)=>{setPassValue(event.target.value)}}
                        value={passValue}
                        placeholder='Password...'
                    />
                </View>
            </CorePopup>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    card: {
        width: '100%',
        height: 300,
        borderRadius: 11,
        marginBottom: 10,
        elevation: 5,
        backgroundColor: ffColors.ffCard,
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        flexDirection: 'row',
    },
    cardImage: {
        aspectRatio: 1/1.2,
        height: '100%',
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
    },
    cardContent: {
        flex: 1,
        padding: 10,
    },
    restaurantName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: ffColors.ffHeading,
        overflow: 'hidden',
        minWidth: 100,
        marginBottom: 8,
    },
    dishName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: ffColors.ffHeading,
        overflow: 'hidden',
        minWidth: 100,
        marginBottom: 8,
    },
    cardDetails: {
        fontSize: 18,
        color: ffColors.ffBody,
        overflow: 'hidden',
        minWidth:100,
        marginTop: 8,
    },
    buttonDeactive: {
        backgroundColor: '#777777',
        width: 100,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    },
    buttonTextDeactive: {
        color: '#444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContent: {
        alignItems: 'flex-end',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap',
        paddingRight:20,
    },
    errorPage: {
        width: '100%',
        paddingTop: 50,
        alignItems: 'center',
    },
    errorMessage: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        margin: 10,
        color: 'red',
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
        width: '100%',
    },
    loginContainer: {
        marginTop:0,
        margin: 20,
    },
})
