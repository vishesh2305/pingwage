import { View, Text, TextInput, Pressable, ScrollView, Image } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get employee name from previous step
  const fullName = (params.employeeName as string) || 'John Doe';

  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [iban, setIban] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const handleCompleteSetup = () => {
    // TODO: API call to save profile data
    console.log('Profile setup completed:', {
      fullName,
      email,
      dateOfBirth,
      iban,
      profilePhoto,
    });
    // Navigate to create passcode screen
    router.push('/create-passcode');
  };

  const handleAddPhoto = () => {
    // TODO: Implement image picker
    console.log('Add profile photo pressed');
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
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#A9A9A9"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
              />
            </View>

            {/* IBAN */}
            <View>
              <Text className="text-white text-base font-medium pb-2">
                Bank account details (IBAN)
              </Text>
              <TextInput
                className="w-full rounded-lg border border-white/20 bg-[#2a2a2a] text-white h-14 px-4 text-base"
                placeholder="Enter your IBAN"
                placeholderTextColor="#A9A9A9"
                autoCapitalize="characters"
                value={iban}
                onChangeText={setIban}
              />
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
          className="w-full rounded-lg h-14 bg-primary items-center justify-center active:opacity-80"
        >
          <Text className="text-background-dark text-base font-bold">
            Complete Setup
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
