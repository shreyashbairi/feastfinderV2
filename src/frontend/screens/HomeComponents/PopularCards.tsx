import React from 'react'

import { 
    SafeAreaView,
    ScrollView, 
    StyleSheet,
    Text,
    TouchableOpacity, 
} from 'react-native'

// navigation
import { useNavigate } from 'react-router-dom';

export default function PopularCards() {
    const testingRestaurants = [
        {
            rid: 1,
            name: 'rest1-red',
            color: '#ff5555'
        },
        {
            rid: 2,
            name: 'rest2-green',
            color: '#55ff55'
        },
        {
            rid: 3,
            name: 'rest3-blue',
            color: '#5555ff'
        },
        {
            rid: 4,
            name: 'rest4-yellow',
            color: '#ffff55'
        },
        {
            rid: 5,
            name: 'rest5-orange',
            color: '#ff8844'
        },
        {
            rid: 6,
            name: 'rest6-purple',
            color: '#aa44ff'
        },
        {
            rid: 7,
            name: 'rest7-pink',
            color: '#ff44ff'
        },
        {
            rid: 8,
            name: 'rest8-teal',
            color: '#50DBbb'
        },
        {
            rid: 9,
            name: 'rest9-light blue',
            color: '#99ccff'
        },
        {
            rid: 10,
            name: 'rest10-grey',
            color: '#aaaaaa'
        },
        {
            rid: 11,
            name: 'rest11-brown',
            color: '#775500'
        },
        {
            rid: 12,
            name: 'rest12-d green',
            color: '#4f7f4f'
        },
    ];

    const navigate = useNavigate();
    //const location = useLocation();

    const handlePop = async (rid: number, name: string, color: string) => {
        console.log("Searching for: " + name);
        try {
            // Send the request to your backend API
            const response = await fetch('http://localhost:5001/api/searchRestaurant?name=' + name);
                
            // Check if the response is OK and parse JSON
            if (response.ok) {
                const restaurants = await response.json();
                // Log the entire restaurant object(s)
                console.log('Restaurants Found:', restaurants);
                navigate('/Search', {state: {search: name, restaurants: restaurants, errorText: ''}})
            } else {
                console.log('No restaurants found');
                navigate('/Search', {state: {search: name, restaurants: undefined, errorText: 'No restaurants found'}})
            }
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            navigate('/Search', {state: {search: name, restaurants: undefined, errorText: 'Error fetching restaurant:'}})
        }
    }

    const restItem = (item: { rid: number; name: string; color: string; }) => {
        return (
            <TouchableOpacity
            key={item.rid}
            style={[styles.card, {backgroundColor: item.color}]}
            onPress={() => {handlePop(item.rid, item.name, item.color)}}
            >
                <Text>
                    {item.name}
                </Text>
            </TouchableOpacity>
        )
    }


    //-----Popular Cards Exported-----
    return (
        <SafeAreaView>
            <Text 
            style={styles.headingText}
            >
                Popular:
            </Text>
            <ScrollView
            style={styles.container}
            horizontal={true}
            >
                {testingRestaurants.map((item) => {
                    return restItem(item);
                })}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    headingText: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingHorizontal: 8
    },
    container: {
        width: '100%',
        marginEnd: 10,
        marginBottom: 40
    },
    card: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 100,
        borderRadius: 10,
        margin: 8,
        elevation: 5,
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowColor: '#333',
        shadowOpacity: .5,
        shadowRadius: 2,
    },
})