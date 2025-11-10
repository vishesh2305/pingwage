//
// FILE: frontend/app/(onboard)/profile-setup.tsx
//
import { View, Text, TextInput, Pressable, ScrollView, Image, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { protectedFetch } from '@/lib/api'; // Import our protected fetch
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get employee name from previous step
  const fullName = (params.employeeName as string) || 'John Doe';
  const [firstName, lastName] = fullName.split(' '); // Split name for backend

  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // Format: YYYY-MM-DD for backend
  const [iban, setIban] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteSetup = async () => {
    // Basic validation
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!dateOfBirth.trim() || dateOfBirth.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid date of birth (YYYY-MM-DD).');
      return;
    }

    if (!iban.trim()) {
      Alert.alert('Validation Error', 'Please enter your IBAN.');
      return;
    }

    // Validate IBAN format
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    if (cleanIban.length < 15 || cleanIban.length > 34) {
      Alert.alert(
        'Invalid IBAN',
        `IBAN must be between 15 and 34 characters.\n\nYou entered: ${cleanIban.length} characters\n\nExample: CH9300762011623852957`
      );
      return;
    }

    // Check if IBAN starts with 2 letters (country code)
    if (!/^[A-Z]{2}/.test(cleanIban)) {
      Alert.alert(
        'Invalid IBAN',
        'IBAN must start with a 2-letter country code (e.g., CH93...)'
      );
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting profile with data:', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        date_of_birth: dateOfBirth
      });

      // 1. Update the worker's profile (name, email, dob)
      // This uses the 'tempToken' from phone verification
      const profileRes = await protectedFetch(
        '/workers/me',
        {
          method: 'PUT',
          body: {
            first_name: firstName,
            last_name: lastName || '', // Handle cases with no last name
            email: email,
            date_of_birth: dateOfBirth, // Ensure this is YYYY-MM-DD
          },
        },
        'tempToken' // Specify using the 'tempToken'
      );

      if (!profileRes.success) {
        throw new Error(profileRes.message || 'Failed to update profile');
      }

      // CRITICAL FIX: Store the userId from the profile response
      // Check if the backend returns worker_id, id, or userId in the response
      const workerId = profileRes.data?.id || profileRes.data?.worker_id || profileRes.data?.userId;
      
      if (workerId) {
        await AsyncStorage.setItem('userId', workerId.toString());
        console.log('Stored userId:', workerId);
      } else {
        console.warn('No userId found in profile response. Checking if it was stored earlier.');
        // If userId wasn't in the profile response, it might have been in the verify-phone response
        // Check if it exists in AsyncStorage already
        const existingUserId = await AsyncStorage.getItem('userId');
        if (!existingUserId) {
          console.error('CRITICAL: No userId available. This will cause issues in create-passcode.');
        }
      }

      // 2. Add the bank account (IBAN)
      const bankRes = await protectedFetch(
        '/workers/bank-account',
        {
          method: 'POST',
          body: {
            iban: iban,
            // bank_name is optional in controller, but IBAN is required
          },
        },
        'tempToken' // Specify using the 'tempToken'
      );

      if (!bankRes.success) {
        throw new Error(bankRes.message || 'Failed to add bank account');
      }

      // 3. Save name to AsyncStorage for the dashboard to use
      await AsyncStorage.setItem('employeeName', firstName);

      console.log('Profile setup completed:', {
        fullName, email, dateOfBirth, iban
      });
      
      // Navigate to create passcode screen
      router.push('/create-passcode');

    } catch (error) {
      console.error('handleCompleteSetup error:', error);
      Alert.alert('Error', (error as Error).message || 'An error occurred during profile setup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPhoto = () => {
    // TODO: Implement image picker
    // After picking an image, you would use protectedFetch to
    // send FormData to '/workers/profile-photo'
    console.log('Add profile photo pressed');
  };

  // A simple formatter for DOB as user types
  const handleDateChange = (text: string) => {
    let newText = text.replace(/[^0-9]/g, ''); // Remove non-numeric
    if (newText.length > 4) {
      newText = newText.substring(0, 4) + '-' + newText.substring(4);
    }
    if (newText.length > 7) {
      newText = newText.substring(0, 7) + '-' + newText.substring(7);
    }
    setDateOfBirth(newText.substring(0, 10)); // YYYY-MM-DD
  };

  return (
    <View className="flex-1 bg-background-dark">
      <ScrollView className="flex-1">
        <View className="flex-1 px-4 pt-10 pb-6">
          {/* Header */}
          <View className="flex-row items-center pb-2">
            <BackButton />
            <Text className="text-white text-lg font-bold flex-1 text-center pr-12">
              Set Up Your Profile
            </Text>
          </View>

          {/* Progress */}
          <View className="w-full mb-8">
            <Text className="text-sm font-medium text-[#A9A9A9] mb-2 text-center">
              Step 3/4
            </Text>
            <View className="w-full h-1.5 rounded-full bg-[#A9A9A9]/30 flex-row">
              <View className="w-1/4 h-1.5 bg-primary rounded-l-full" />
              <View className="w-1/4 h-1.5 bg-primary" />
              <View className="w-1/4 h-1.5 bg-primary" />
              <View className="w-1/4 h-1.5 bg-transparent rounded-r-full" />
            </View>
          </View>

          {/* Profile Photo Section */}
          <View className="w-full items-center py-6">
            <View className="relative">
              <View className="h-32 w-32 rounded-full bg-[#2a2a2a] items-center justify-center">
                {profilePhoto ? (
                  <Image
                    source={{ uri: profilePhoto }}
                    className="h-32 w-32 rounded-full"
                  />
                ) : (
                  <Ionicons name="person" size={48} color="#A9A9A9" />
                )}
              </View>
              <Pressable
                onPress={handleAddPhoto}
                className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full border-2 border-background-dark items-center justify-center active:opacity-80"
              >
                <Ionicons name="add" size={20} color="#181711" />
              </Pressable>
            </View>
            <Pressable onPress={handleAddPhoto} className="mt-4">
              <Text className="text-primary text-sm font-bold">
                Add a profile photo (optional)
              </Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View className="flex flex-col gap-4">
            {/* Full Name (Read-only) */}
            <View>
              <Text className="text-white text-base font-medium pb-2">
                Full name
              </Text>
              <TextInput
                className="w-full rounded-lg bg-[#222222] text-[#A9A9A9] h-14 px-4 text-base"
                value={fullName}
                editable={false}
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-white text-base font-medium pb-2">
                Email
              </Text>
              <TextInput
                className="w-full rounded-lg border border-white/20 bg-[#2a2a2a] text-white h-14 px-4 text-base"
                placeholder="Enter your email address"
                placeholderTextColor="#A9A9A9"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Date of Birth */}
            <View>
              <Text className="text-white text-base font-medium pb-2">
                Date of birth
              </Text>
              <TextInput
                className="w-full rounded-lg border border-white/20 bg-[#2a2a2a] text-white h-14 px-4 text-base"
                placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                placeholderTextColor="#A9A9A9"
                value={dateOfBirth}
                onChangeText={handleDateChange}
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text className="text-[#A9A9A9] text-xs mt-1">
                Format: YYYY-MM-DD
              </Text>
            </View>

            {/* IBAN */}
            <View>
              <Text className="text-white text-base font-medium pb-2">
                Bank account details (IBAN)
              </Text>
              <TextInput
                className="w-full rounded-lg border border-white/20 bg-[#2a2a2a] text-white h-14 px-4 text-base"
                placeholder="CH93 0076 2011 6238 5295 7"
                placeholderTextColor="#A9A9A9"
                autoCapitalize="characters"
                value={iban}
                onChangeText={setIban}
              />
              <Text className="text-[#A9A9A9] text-xs mt-1">
                15-34 characters (e.g., CH9300762011623852957)
              </Text>
            </View>

            {/* Security Message */}
            <View className="flex-row items-center justify-center gap-2 pt-2">
              <Ionicons name="lock-closed" size={16} color="#4ADE80" />
              <Text className="text-xs text-[#A9A9A9]">
                Your data is securely encrypted
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Complete Setup Button */}
      <View className="px-4 py-6">
        <Pressable
          onPress={handleCompleteSetup}
          disabled={isLoading}
          className={`w-full rounded-lg h-14 bg-primary items-center justify-center active:opacity-80 ${isLoading ? 'opacity-50' : ''}`}
        >
          <Text className="text-background-dark text-base font-bold">
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}