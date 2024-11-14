import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, CheckBox } from 'react-native';
import React, { useEffect } from 'react';
import CoreBanner from '../../CoreComponents/CoreBanner.tsx';
import { useAuth } from '../../UserComponents/Authorizer.tsx';
import AccountLinkedAPIs from './AccountLinkedAPIs.tsx';
import tw from 'twrnc';
import { coreForm } from '../../CoreComponents/CoreStyles.tsx';
import { API_BASE_URL } from '../../../../config.js';

export default function Account() {
  const { user } = useAuth();
  const [currentAddress, setCurrentAddress] = React.useState(''); // This will be fetched from the backend
  const [newAddress, setNewAddress] = React.useState('');
  const [dietaryPreferences, setDietaryPreferences] = React.useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
  });
  const [errorMessage, setErrorMessage] = React.useState('');

  // Fetch the current address and dietary preferences from backend on component load
  useEffect(() => {
    const fetchProfileData = async () => {
     
      try {
        const addressResponse = await fetch('${API_BASE_URL}/api/address/recent', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + user.token, // Add auth token
          },
        });
        const addressData = await addressResponse.json();
        setCurrentAddress(`${addressData.street}, ${addressData.city}, ${addressData.state}, ${addressData.postalCode}, ${addressData.country}`);

        const preferencesResponse = await fetch('${API_BASE_URL}/api/preferences', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + user.token,
          },
        });
        const preferencesData = await preferencesResponse.json();
        setDietaryPreferences({
          vegetarian: preferencesData.dietaryPreferences.includes('vegetarian'),
          vegan: preferencesData.dietaryPreferences.includes('vegan'),
          glutenFree: preferencesData.dietaryPreferences.includes('glutenFree'),
          dairyFree: preferencesData.dietaryPreferences.includes('dairyFree'),
          nutFree: preferencesData.dietaryPreferences.includes('nutFree'),
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    if (user)
      fetchProfileData();
  }, [user]);

  // Address format validation
  const isValidAddressFormat = (address) => {
    const addressParts = address.split(',').map(part => part.trim());
    return addressParts.length === 5; // Ensure there are exactly 5 parts
  };

  // Handle address save
  const handleSaveAddress = async () => {
    if (!isValidAddressFormat(newAddress)) {
      setErrorMessage('Please enter a valid address format: street, city, state, postal code, country.');
      return;
    }

    setErrorMessage('');

    try {
      const address = newAddress.split(','); // Split address into components
      const response = await fetch('${API_BASE_URL}/api/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user.token,
        },
        body: JSON.stringify({
          street: address[0],
          city: address[1],
          state: address[2],
          postalCode: address[3],
          country: address[4],
        }),
      });

      if (response.ok) {
        setCurrentAddress(newAddress); // Update the displayed current address only after successful submission
        setNewAddress(''); // Clear new address input
      } else {
        setErrorMessage('Failed to update the address.');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      setErrorMessage('An error occurred while updating the address.');
    }
  };

  // Handle dietary preferences save
  const handleSavePreferences = async () => {
    const selectedPreferences = Object.keys(dietaryPreferences).filter(key => dietaryPreferences[key]);

    try {
      const response = await fetch('${API_BASE_URL}/api/preferences/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user.token,
        },
        body: JSON.stringify({
          preferences: selectedPreferences,
        }),
      });

      if (response.ok) {
        //alert('Dietary preferences updated successfully.');
      } else {
        setErrorMessage('Failed to update dietary preferences.');
      }
    } catch (error) {
      console.error('Error updating dietary preferences:', error);
      setErrorMessage('An error occurred while updating dietary preferences.');
    }
  };

  // Handle checkbox change for dietary preferences
  const handleCheckboxChange = (preference) => {
    setDietaryPreferences((prevPreferences) => ({
      ...prevPreferences,
      [preference]: !prevPreferences[preference],
    }));
  };

  return (
    <div style={tw.style(coreForm.container)}>
      <CoreBanner />
      <div style={tw.style(coreForm.innerContainer)}>
        <div style={coreForm.headerContainer}>
          <h2 style={coreForm.title}>FeastFinder</h2>
          <h2 style={coreForm.subtitle}>Account Management</h2>
        </div>
        <View style={tw.style(coreForm.content)}>
          <div style={coreForm.card}>
            {/* Error Message Display */}
            {errorMessage ? (
              <View style={tw.style(coreForm.formItem)}>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Current Address Display */}
            <View style={tw.style(coreForm.formItem)}>
              <Text style={tw.style(coreForm.subheader)}>Current Address:</Text>
              <View style={tw.style(coreForm.body)}>
                <Text style={styles.currentAddressText}>{currentAddress || 'Loading...'}</Text>
              </View>
            </View>

            {/* New Address Input Field */}
            <View style={tw.style(coreForm.formItem)}>
              <Text style={tw.style(coreForm.subheader)}>New Address:</Text>
              <View style={tw.style(coreForm.body)}>
                <TextInput
                  style={tw.style(coreForm.textInputSingle)}
                  placeholder="Enter your new address"
                  value={newAddress}
                  onChangeText={(text) => setNewAddress(text)} // Only update newAddress state
                />
              </View>
            </View>

            {/* Dietary Preferences Checkboxes */}
            <View style={tw.style(coreForm.formItem)}>
              <Text style={tw.style(coreForm.subheader)}>Dietary Preferences:</Text>
              <View style={tw.style(coreForm.body)}>
                <View style={tw.style(coreForm.checkboxContainer)}>
                  <View style={tw.style(coreForm.checkboxItem)}>
                    <CheckBox
                      value={dietaryPreferences.vegetarian}
                      onValueChange={() => handleCheckboxChange('vegetarian')}
                    />
                    <Text style={tw.style(coreForm.checkboxLabel)}>Vegetarian</Text>
                  </View>

                  <View style={tw.style(coreForm.checkboxItem)}>
                    <CheckBox
                      value={dietaryPreferences.vegan}
                      onValueChange={() => handleCheckboxChange('vegan')}
                    />
                    <Text style={tw.style(coreForm.checkboxLabel)}>Vegan</Text>
                  </View>

                  <View style={tw.style(coreForm.checkboxItem)}>
                    <CheckBox
                      value={dietaryPreferences.glutenFree}
                      onValueChange={() => handleCheckboxChange('glutenFree')}
                    />
                    <Text style={tw.style(coreForm.checkboxLabel)}>Gluten-Free</Text>
                  </View>

                  <View style={tw.style(coreForm.checkboxItem)}>
                    <CheckBox
                      value={dietaryPreferences.dairyFree}
                      onValueChange={() => handleCheckboxChange('dairyFree')}
                    />
                    <Text style={tw.style(coreForm.checkboxLabel)}>Dairy-Free</Text>
                  </View>

                  <View style={tw.style(coreForm.checkboxItem)}>
                    <CheckBox
                      value={dietaryPreferences.nutFree}
                      onValueChange={() => handleCheckboxChange('nutFree')}
                    />
                    <Text style={tw.style(coreForm.checkboxLabel)}>Nut-Free</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Link Accounts */}
            <View style={tw.style(coreForm.formItem)}>
              <AccountLinkedAPIs/>
            </View>

            {/* Save Button */}
            <View style={tw.style(coreForm.buttonContainer)}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                <Text style={styles.buttonText}>Save Address</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSavePreferences}>
                <Text style={styles.buttonText}>Save Preferences</Text>
              </TouchableOpacity>
            </View>
          </div>
        </View>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  errorMessage: {
    color: 'red',
    fontSize: 16,
  },
  currentAddressText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
