import React from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  View,
  TextInput, // Add TextInput
} from "react-native";
import { API_BASE_URL } from '../../../config.js';

import { useAuth } from "../UserComponents/Authorizer.tsx";
import { ffColors } from "../CoreComponents/CoreStyles.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import CorePopup from "../CoreComponents/CorePopup.tsx";
import CoreButton from "../CoreComponents/CoreButton.tsx";
import { Star } from "lucide-react";
interface Review {
  reviewId: number;
  username: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

interface Restaurant {
  restaurantID: string;
  restaurantName: string;
  restaurantImage?: string;
  distance: number;
  restaurantAddress: string;
  doordashAvailable: boolean;
  grubhubAvailable: boolean;
  ubereatsAvailable: boolean;
  reviews: Review[];
  averageRating: number;
}

export default function SearchCards() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    results = [],
    searchType,
    search,
    deliveryService,
    errorText,
  } = location.state;

  const [userValue, setuserValue] = React.useState("");
  const [passValue, setPassValue] = React.useState("");
  const [errPop, setErrPop] = React.useState(false);
  const [errText, setErrText] = React.useState("Error Undefined");
  const [loginPop, setLoginPop] = React.useState(false);
  const [buttonService, setButtonService] = React.useState("Error Undefined");
  const [holdItem, setHoldItem] = React.useState(null);
  const { user } = useAuth();
  const [isLoadingReviews, setIsLoadingReviews] = React.useState(false);

  // Modified review states to include all reviews
  const [reviewPop, setReviewPop] = React.useState(false);
  const [reviewsViewPop, setReviewsViewPop] = React.useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    React.useState<Restaurant | null>(null);
  const [selectedRestaurantReviews, setSelectedRestaurantReviews] =
    React.useState<Review[]>([]);
  const [reviewText, setReviewText] = React.useState("");
  const [rating, setRating] = React.useState<number>(0);
  const [hoveredRating, setHoveredRating] = React.useState<number>(0);
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);

  // Dummy data for initial reviews
  const dummyReviews = [
    {
      reviewId: 1,
      username: "JohnDoe",
      rating: 4,
      reviewText: "Great food and atmosphere! Would definitely come back.",
      createdAt: "2024-03-15T10:30:00",
    },
    {
      reviewId: 2,
      username: "JaneSmith",
      rating: 5,
      reviewText: "Best restaurant in town. The service was exceptional.",
      createdAt: "2024-03-14T15:45:00",
    },
    {
      reviewId: 3,
      username: "MikeJohnson",
      rating: 3,
      reviewText: "Decent food but a bit pricey. Service was okay.",
      createdAt: "2024-03-13T18:20:00",
    },
  ];

  // Initialize restaurants state when results change
  React.useEffect(() => {
    const initializedRestaurants = results.map((restaurant) => ({
      ...restaurant,
      reviews: [],
      averageRating: 0,
    }));
    setRestaurants(initializedRestaurants);
    results.forEach((restaurant) => {
      fetchReviews(restaurant.restaurantID);
    });
  }, [results]);

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  const filterBySelectedService = (item) => {
    if (deliveryService === "UberEats") return item.ubereatsAvailable;
    if (deliveryService === "Grubhub") return item.grubhubAvailable;
    if (deliveryService === "DoorDash") return item.doordashAvailable;
    return true;
  };

  const filteredResults = results.filter(filterBySelectedService);

  const resetUserPass = () => {
    setuserValue("");
    setPassValue("");
  };

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
      var fetchAddr = `${API_BASE_URL}/api/auth/app-login`;
      response = await fetch(fetchAddr, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
        body: JSON.stringify({
          email: userValue,
          password: passValue,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to register");
      }

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
      setButtonService("Error Undefined");
      resetUserPass();
      navigate("/restaurant", {
        state: { restaurant: holdItem, service: buttonService },
      });
    } catch (err) {
      setErrText(err.message);
      setErrPop(true);
    }
  };

  const checkLogin = async (service: string, item) => {
    let fetchAddr = `${API_BASE_URL}/api/auth/app-status`;
    
    try {
      const res = await fetch(fetchAddr, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      });
      if (res.ok) {
        const data = await res.json();
        let isStored;
        // console.log(service)
        switch (service) {
          case "DoorDash":
              isStored = data.doordash_logged_in;
              break;
          case "GrubHub":
              isStored = data.grubhub_logged_in;
              break;
          case "UberEats":
              isStored = data.uber_logged_in;
              break;
          default:
            console.error("switchFailure");
            setErrText(
              "Internal Service Error\nDelivery Service not recognized"
            );
            setErrPop(true);
            return;
        }

        if (isStored) {
          navigate("/restaurant", {
            state: { restaurant: item, service: service },
          });
        } else {
          setHoldItem(item);
          setButtonService(service);
          setLoginPop(true);
        }
      } else {
        const errorData = await res.json();
        setErrText(errorData.msg);
        setErrPop(true);
      }
    } catch (error) {
      setErrText("Network error\nCheck internet connection");
      setErrPop(true);
    }
  };

  const APIButton = (service: string, available: boolean, item) => {
    if (available) {
      return (
        <CoreButton
          pressFunc={() => {
            checkLogin(service, item);
          }}
          bText={service}
          buttonColor={ffColors.ffGreenL}
        />
      );
    } else {
      return (
        <View style={styles.buttonDeactive}>
          <Text style={styles.buttonTextDeactive}>{service}</Text>
        </View>
      );
    }
  };

  const StarRating = ({
    rating,
    interactive = false,
    onRatingChange = () => {},
    hoverRating = null,
  }: {
    rating: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    hoverRating?: number | null;
  }) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{
              cursor: interactive ? "pointer" : "default",
              marginRight: 4,
            }}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            onMouseEnter={
              interactive ? () => setHoveredRating(star) : undefined
            }
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
            fill={
              (interactive ? star <= (hoveredRating || rating) : star <= rating)
                ? "#FFD700"
                : "none"
            }
            color="#FFD700"
            size={interactive ? 32 : 20}
          />
        ))}
        {!interactive && (
          <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
        )}
      </View>
    );
  };

  const handleReviewSubmit = async () => {
    console.log('=== Starting Review Submission ===');
    console.log('Review Data:', {
      restaurantID: selectedRestaurant?.restaurantID,
      username: user?.username,
      rating,
      reviewText,
      token: user?.token // Don't log full token in production!
    });
  
    if (rating === 0) {
      console.log('Validation failed: No rating selected');
      setErrText("Please select a rating");
      setErrPop(true);
      return;
    }
  
    if (!reviewText.trim()) {
      console.log('Validation failed: No review text');
      setErrText("Please write a review");
      setErrPop(true);
      return;
    }
  
    if (!selectedRestaurant) {
      console.log('Validation failed: No restaurant selected');
      setErrText("No restaurant selected");
      setErrPop(true);
      return;
    }
  
    try {
      console.log('Sending POST request to /api/reviews');
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + user.token,
        },
        body: JSON.stringify({
          restaurantID: selectedRestaurant.restaurantID,
          username: user?.username || 'Anonymous',
          rating: rating,
          reviewText: reviewText,
        }),
      });
  
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server responded with error:', errorText);
        throw new Error(errorText);
      }
  
      const savedReview = await response.json();
      console.log('Successfully saved review:', savedReview);
  
      // Fetch updated reviews
      console.log('Fetching updated reviews for restaurant:', selectedRestaurant.restaurantID);
      await fetchReviews(selectedRestaurant.restaurantID);
  
      // Reset form and close popup
      console.log('Resetting form and closing popup');
      setReviewText("");
      setRating(0);
      setReviewPop(false);
      setSelectedRestaurant(null);
  
    } catch (error) {
      console.error('Error in handleReviewSubmit:', error);
      setErrText('Failed to submit review: ' + error.message);
      setErrPop(true);
    }
  };

  const fetchReviews = async (restaurantID) => {
    setIsLoadingReviews(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/restaurant/${restaurantID}`);
      if (response.ok) {
        const reviews = await response.json();
        // Update restaurants state with fetched reviews
        setRestaurants((prevRestaurants) => {
          return prevRestaurants.map((restaurant) => {
            if (restaurant.restaurantID === restaurantID) {
              return {
                ...restaurant,
                reviews: reviews,
                averageRating: calculateAverageRating(reviews),
              };
            }
            return restaurant;
          });
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setErrText('Failed to load reviews');
      setErrPop(true);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const restItem = (item: Restaurant, index: number) => {
    const restaurantData =
      restaurants.find((r) => r.restaurantID === item.restaurantID) || item;

    return (
      <View key={restaurantData.restaurantID} style={styles.card}>
        <Image
          source={{
            uri: restaurantData.restaurantImage
              ? String(restaurantData.restaurantImage)
              : "/images/testRest.png",
          }}
          style={styles.cardImage}
          resizeMode="contain"
        />
        <View style={styles.cardContent}>
          <Text numberOfLines={1} style={styles.restaurantName}>
            {restaurantData.restaurantName}
          </Text>
          <StarRating rating={restaurantData.averageRating || 0} />
          <Text numberOfLines={1} style={styles.cardDetails}>
            Distance: {restaurantData.distance.toString()} Miles
          </Text>
          <Text numberOfLines={1} style={styles.cardDetails}>
            Address: {restaurantData.restaurantAddress}
          </Text>
          <Text numberOfLines={5} style={styles.cardDetails}>
            Description: {restaurantData.restaurantName + " Description..."}
          </Text>
          <View style={styles.reviewButtonsContainer}>
            <CoreButton
              pressFunc={() => {
                setSelectedRestaurant(restaurantData);
                setReviewPop(true);
              }}
              bText="Leave a Review"
              buttonColor={ffColors.ffBlueL}
            />
            <CoreButton
              pressFunc={() => {
                setSelectedRestaurant(restaurantData);
                setSelectedRestaurantReviews(restaurantData.reviews);
                setReviewsViewPop(true);
              }}
              bText="View Reviews"
              buttonColor={ffColors.ffPurpleL}
            />
          </View>
        </View>
        <View style={styles.buttonContent}>
          {APIButton(
            "DoorDash",
            restaurantData.doordashAvailable,
            restaurantData
          )}
          {APIButton(
            "GrubHub",
            restaurantData.grubhubAvailable,
            restaurantData
          )}
          {APIButton(
            "UberEats",
            restaurantData.ubereatsAvailable,
            restaurantData
          )}
        </View>
      </View>
    );
  };

  const goToDishRestaurants = async (dishName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/searchRestaurant?dish=${encodeURIComponent(
          dishName
        )}`
      );
      if (response.ok) {
        const restaurantResults = await response.json();
        navigate("/Search", {
          state: {
            search: dishName,
            results: restaurantResults,
            searchType: "restaurant",
            deliveryService,
          },
        });
      } else {
        console.log("No restaurants found for dish:", dishName);
        navigate("/Search", {
          state: {
            search: dishName,
            results: [],
            searchType: "restaurant",
            deliveryService,
            errorText: "No results found",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      navigate("/Search", {
        state: {
          search: dishName,
          results: [],
          searchType: "restaurant",
          deliveryService,
          errorText: "Error fetching restaurants",
        },
      });
    }
  };

  const dishItem = (item, index) => {
    return (
      <View key={index} style={styles.card}>
        <Image
          source={{
            uri: item.image ? String(item.image) : "/images/default_dish.png",
          }}
          style={styles.cardImage}
          resizeMode="contain"
        />
        <View style={styles.cardContent}>
          <Text numberOfLines={1} style={styles.dishName}>
            {item.dishName}
          </Text>
          <Text numberOfLines={1} style={styles.cardDetails}>
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
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {filteredResults.length > 0 ? (
          searchType === "restaurant" ? (
            filteredResults.map((item, index) => restItem(item, index))
          ) : (
            filteredResults.map((item, index) => dishItem(item, index))
          )
        ) : (
          <View style={styles.errorPage}>
            <Text style={styles.errorMessage}>
              {errorText ||
                `No results found for ${deliveryService || "all services"}.`}
            </Text>
          </View>
        )}
      </View>

      {/* Error Popup */}
      <CorePopup
        pop={errPop}
        popTitle={"Error:"}
        popText={errText}
        closeFunc={() => {
          setErrPop(false);
          setErrText("Error Undefined");
        }}
        titleColor={ffColors.ffRedL}
        buttons={[
          {
            bText: "Close",
            bColor: ffColors.ffRedL,
            bFunc: () => {
              setErrPop(false);
              setErrText("Error Undefined");
            },
          },
        ]}
      />

      {/* Login Popup */}
      <CorePopup
        popTitle={"Not logged into " + buttonService + ":"}
        popText={""}
        closeFunc={() => {
          setLoginPop(false);
          setButtonService("Error Undefined");
          resetUserPass();
        }}
        pop={loginPop}
        titleColor={ffColors.ffRedL}
        buttons={[
          {
            bText: "Submit",
            bColor: ffColors.ffGreenL,
            bFunc: () => {
              popSubmitHandler();
            },
          },
          {
            bText: "Close",
            bColor: ffColors.ffRedL,
            bFunc: () => {
              setLoginPop(false);
              setButtonService("Error Undefined");
              resetUserPass();
            },
          },
        ]}
      >
        <View style={styles.loginContainer}>
          <Text style={styles.popupText}>Login:</Text>
          <TextInput
            style={styles.popInput}
            onChangeText={setuserValue}
            value={userValue}
            placeholder="Username..."
          />
          <TextInput
            style={styles.popInput}
            onChangeText={setPassValue}
            value={passValue}
            placeholder="Password..."
            secureTextEntry={true}
          />
        </View>
      </CorePopup>

      {/* Review Popup */}
      <CorePopup
        popTitle={`Leave a Review for ${
          selectedRestaurant?.restaurantName || ""
        }`}
        popText={""}
        closeFunc={() => {
          setReviewPop(false);
          setSelectedRestaurant(null);
          setReviewText("");
          setRating(0);
          setHoveredRating(0);
        }}
        pop={reviewPop}
        titleColor={ffColors.ffBlueL}
        buttons={[
          {
            bText: "Submit",
            bColor: ffColors.ffGreenL,
            bFunc: handleReviewSubmit,
          },
          {
            bText: "Cancel",
            bColor: ffColors.ffRedL,
            bFunc: () => {
              setReviewPop(false);
              setSelectedRestaurant(null);
              setReviewText("");
              setRating(0);
              setHoveredRating(0);
            },
          },
        ]}
      >
        <View style={styles.reviewContainer}>
          <Text style={styles.popupText}>Rate your experience:</Text>
          <StarRating
            rating={rating}
            interactive={true}
            onRatingChange={setRating}
            hoverRating={hoveredRating}
          />
          <Text style={styles.popupText}>Your review:</Text>
          <TextInput
            style={styles.reviewInput}
            onChangeText={setReviewText}
            value={reviewText}
            placeholder="Write your review here..."
            multiline={true}
            numberOfLines={4}
          />
        </View>
      </CorePopup>

      {/* Reviews View Popup */}
      <CorePopup
        popTitle={`Reviews for ${selectedRestaurant?.restaurantName || ""}`}
        popText={""}
        closeFunc={() => {
          setReviewsViewPop(false);
          setSelectedRestaurant(null);
          setSelectedRestaurantReviews([]);
        }}
        pop={reviewsViewPop}
        titleColor={ffColors.ffBlueL}
        buttons={[
          {
            bText: "Close",
            bColor: ffColors.ffRedL,
            bFunc: () => {
              setReviewsViewPop(false);
              setSelectedRestaurant(null);
              setSelectedRestaurantReviews([]);
            },
          },
        ]}
      >
        <ScrollView style={styles.reviewsContainer}>
          <View style={styles.reviewsSummary}>
            <StarRating rating={selectedRestaurant?.averageRating || 0} />
            <Text style={styles.reviewsCount}>
              {selectedRestaurantReviews.length} reviews
            </Text>
          </View>
          {selectedRestaurantReviews.map((review) => (
            <View key={review.reviewId} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUsername}>{review.username}</Text>
                <StarRating rating={review.rating} />
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.reviewText}>{review.reviewText}</Text>
            </View>
          ))}
        </ScrollView>
      </CorePopup>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    width: "100%",
    height: 300,
    borderRadius: 11,
    marginBottom: 10,
    elevation: 5,
    backgroundColor: ffColors.ffCard,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    flexDirection: "row",
  },
  cardImage: {
    aspectRatio: 1 / 1.2,
    height: "100%",
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
  cardContent: {
    flex: 1,
    padding: 10,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: "bold",
    color: ffColors.ffHeading,
    overflow: "hidden",
    minWidth: 100,
    marginBottom: 8,
  },
  dishName: {
    fontSize: 24,
    fontWeight: "bold",
    color: ffColors.ffHeading,
    overflow: "hidden",
    minWidth: 100,
    marginBottom: 8,
  },
  cardDetails: {
    fontSize: 18,
    color: ffColors.ffBody,
    overflow: "hidden",
    minWidth: 100,
    marginTop: 8,
  },
  buttonDeactive: {
    backgroundColor: "#777777",
    width: 100,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  buttonTextDeactive: {
    color: "#444",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContent: {
    alignItems: "flex-end",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    paddingRight: 20,
  },
  errorPage: {
    width: "100%",
    paddingTop: 50,
    alignItems: "center",
  },
  errorMessage: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 8,
    margin: 10,
    color: "red",
  },
  popupText: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "bold",
  },
  popInput: {
    height: 'auto',
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    width: '100%',
    fontSize: 14,
  },
  loginContainer: {
    marginTop: 0,
    margin: 20,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    color: ffColors.ffBody,
  },
  reviewContainer: {
    margin: 20,
  },
  reviewInput: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: '100%',
    minHeight: 100,
    borderColor: '#ccc',
    fontSize: 14,
    textAlignVertical: 'top', // Ensures text starts at the top
  },
  reviewButtonsContainer: {
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
  },
  reviewsContainer: {
    maxHeight: 400,
    padding: 10,
  },
  reviewsSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 15,
  },
  reviewsCount: {
    marginLeft: 10,
    fontSize: 16,
    color: ffColors.ffBody,
  },
  reviewItem: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  reviewUsername: {
    fontWeight: "bold",
    fontSize: 16,
    color: ffColors.ffHeading,
  },
  reviewDate: {
    fontSize: 14,
    color: "#666",
  },
  reviewText: {
    fontSize: 14,
    color: ffColors.ffBody,
    lineHeight: 20,
  },
});
