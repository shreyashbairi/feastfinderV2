import { Image, Pressable, StyleSheet, TouchableOpacity, View, Modal, Button, Text } from 'react-native';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ffColors } from './CoreStyles.tsx';
import CoreDrawer from './CoreDrawer.tsx';

interface Props {
    searchVal?: string;
}

const CoreBanner: React.FC<Props> = ({ searchVal }) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchTerm] = useState(searchVal);
    const [deliveryService, setDeliveryService] = useState(''); // State for delivery service
    const [cuisine, setCuisine] = useState(''); // State for cuisine filter
    const [searchType, setSearchType] = useState('restaurant'); // New state for differentiating search types
    const [isFilterPopupVisible, setFilterPopupVisible] = useState(false); // State to control popup visibility
    const [timeRanges, setTimeRanges] = useState({
        breakfast: false,
        brunch: false,
        lunch: false,
        dinner: false,
        allDay: false,
    });

    const navigate = useNavigate();
    const location = useLocation();

    function navigationHandler() {
        if (location.pathname !== '/Home' && location.pathname !== '/') {
            navigate('/Home');
        }
    }

    // Send search query, search type, and filters to the backend
    const keyHandler = async (event) => {
        if (event.key === 'Enter' && searchValue !== '') {
            const selectedTimeRanges = Object.keys(timeRanges).filter((range) => timeRanges[range]);
            console.log(`Searching for: ${searchValue}, Type: ${searchType}, Service: ${deliveryService}, Cuisine: ${cuisine}, and Time Ranges: ${selectedTimeRanges}`);

            try {
                const response = await fetch(`http://localhost:5001/api/search?name=${searchValue}&type=${searchType}&service=${deliveryService}&cuisine=${cuisine}&timeRanges=${selectedTimeRanges}`);
                
                if (response.ok) {
                    const results = await response.json();
                    console.log('Results Found:', results);
                    navigate('/Search', { state: { search: searchValue, results, searchType, deliveryService, cuisine, timeRanges: selectedTimeRanges } });
                } else {
                    console.log('No results found');
                    navigate('/Search', { state: { search: searchValue, results: undefined, searchType, deliveryService, cuisine, timeRanges: selectedTimeRanges, errorText: 'No results found' } });
                }
            } catch (error) {
                console.error('Error fetching results:', error);
                navigate('/Search', { state: { search: searchValue, results: undefined, searchType, deliveryService, cuisine, timeRanges: selectedTimeRanges, errorText: 'Error fetching results' } });
            }
        }
    };

    const inputHandler = (event) => {
        setSearchTerm(event.target.value);
    };

    // Handle the search type change (restaurant or dish)
    const handleSearchTypeChange = (event) => {
        setSearchType(event.target.value);
    };

    // Open or close the filter popup
    const toggleFilterPopup = () => {
        setFilterPopupVisible(!isFilterPopupVisible);
    };

    // Handle checkbox change for time ranges
    const handleTimeRangeChange = (range) => {
        setTimeRanges((prevRanges) => ({
            ...prevRanges,
            [range]: !prevRanges[range],
        }));
    };

    // Handle form submission for filtering
    const applyFilters = () => {
        setFilterPopupVisible(false);
        console.log('Filters applied:', { deliveryService, cuisine, timeRanges });
    };

    return (
        <View style={styles.pageContainer}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <Pressable style={styles.cardImageHolder} onPress={navigationHandler}>
                        <Image source={require('../images/FeastFinder-solid-circle.png')} style={styles.cardImage} />
                    </Pressable>
                    <input
                        type="text"
                        style={styles.search}
                        onChange={inputHandler}
                        value={searchValue}
                        placeholder="Search..."
                        onKeyDown={keyHandler}
                    />
                    {/* Dropdown to select search type (Restaurant or Dish) within the search bar */}
                    <select style={styles.searchTypeDropdown} onChange={handleSearchTypeChange} value={searchType}>
                        <option value="restaurant">Restaurants</option>
                        <option value="dish">Dishes</option>
                    </select>
                    {/* Filter Button to open the popup */}
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            searchType === 'dish' && styles.filterButtonDisabled, // Apply disabled styling when dishes are selected
                        ]}
                        onPress={toggleFilterPopup}
                        disabled={searchType === 'dish'} // Disable filter when dish is selected
                    >
                        <Text style={styles.filterButtonText}>Filter</Text>
                    </TouchableOpacity>
                    <CoreDrawer open={open} setOpen={setOpen} />
                </View>
            </View>

            {/* Modal for filter options */}
            <Modal visible={isFilterPopupVisible} animationType="slide" transparent={true}>
                <View style={styles.popupOverlay}>
                    <View style={styles.popupContainer}>
                        <Text style={styles.popupTitle}>Filter Options</Text>

                        {/* Delivery Service Filter */}
                        <Text style={styles.popupLabel}>Delivery Service:</Text>
                        <select style={styles.dropdown} onChange={(e) => setDeliveryService(e.target.value)} value={deliveryService}>
                            <option value="">All Services</option>
                            <option value="UberEats">UberEats</option>
                            <option value="Grubhub">Grubhub</option>
                            <option value="DoorDash">DoorDash</option>
                        </select>

                        {/* Cuisine Filter */}
                        <Text style={styles.popupLabel}>Cuisine:</Text>
                        <select style={styles.dropdown} onChange={(e) => setCuisine(e.target.value)} value={cuisine}>
                            <option value="">All Cuisines</option>
                            <option value="Italian">Italian</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Mexican">Mexican</option>
                            <option value="Indian">Indian</option>
                            <option value="Japanese">Japanese</option>
                        </select>

                        {/* Time Ranges Filter */}
                        <Text style={styles.popupLabel}>Operating Hours:</Text>
                        <View style={styles.checkboxContainer}>
                            <View style={styles.checkboxItem}>
                                <input type="checkbox" checked={timeRanges.breakfast} onChange={() => handleTimeRangeChange('breakfast')} />
                                <Text style={styles.checkboxLabel}>Breakfast (6:00 AM - 10:00 AM)</Text>
                            </View>
                            <View style={styles.checkboxItem}>
                                <input type="checkbox" checked={timeRanges.brunch} onChange={() => handleTimeRangeChange('brunch')} />
                                <Text style={styles.checkboxLabel}>Brunch (10:00 AM - 12:00 PM)</Text>
                            </View>
                            <View style={styles.checkboxItem}>
                                <input type="checkbox" checked={timeRanges.lunch} onChange={() => handleTimeRangeChange('lunch')} />
                                <Text style={styles.checkboxLabel}>Lunch (12:00 PM - 3:00 PM)</Text>
                            </View>
                            <View style={styles.checkboxItem}>
                                <input type="checkbox" checked={timeRanges.dinner} onChange={() => handleTimeRangeChange('dinner')} />
                                <Text style={styles.checkboxLabel}>Dinner (5:00 PM - 9:00 PM)</Text>
                            </View>
                            <View style={styles.checkboxItem}>
                                <input type="checkbox" checked={timeRanges.allDay} onChange={() => handleTimeRangeChange('allDay')} />
                                <Text style={styles.checkboxLabel}>All-Day (24/7)</Text>
                            </View>
                        </View>

                        {/* Apply and Close Buttons */}
                        <View style={styles.popupButtonContainer}>
                            <Button title="Apply Filters" onPress={applyFilters} />
                            <Button title="Close" color="red" onPress={toggleFilterPopup} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CoreBanner;

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
    },
    container: {
        width: '100%',
        height: '100%',
    },
    search: {
        height: 60,
        margin: 20,
        marginRight: 25,
        borderWidth: 1,
        flexGrow: 1,
        borderRadius: 20,
        padding: 10,
    },
    searchTypeDropdown: {
        height: 60,
        width: 150,
        marginRight: 20,
        borderRadius: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
    },
    filterButton: {
        backgroundColor: ffColors.ffGreenL,
        height: 60,
        margin: 20,
        padding: 10,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    filterButtonDisabled: {
        backgroundColor: '#ccc', // Grey out the filter button when disabled
    },
    card: {
        width: '100%',
        backgroundColor: ffColors.ffGreenD,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardImageHolder: {
        height: 90,
        width: 120,
        margin: 5,
        borderRadius: 45,
    },
    cardImage: {
        height: 90,
        width: 120,
    },
    popupOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    popupContainer: {
        width: '80%',
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    popupTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    popupLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    checkboxContainer: {
        marginTop: 10,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxLabel: {
        marginLeft: 10,
    },
    popupButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    dropdown: {
        height: 50,
        width: '100%',
        marginVertical: 10,
        padding: 10,
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 1,
    },
});
