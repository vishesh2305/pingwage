import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { protectedFetch } from '@/lib/api';

export default function CompanyVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [companyId, setCompanyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<{
    companyName: string;
    employeeName: string | null;
    employerId: string;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Get phone number from navigation params
  const userPhoneNumber = params.phoneNumber as string;

  const handleSearch = async () => {
    if (!companyId.trim()) return;

    setIsLoading(true);
    setNotFound(false);
    setEmployeeData(null);

    try {
      console.log('Verifying company ID:', companyId, 'for phone:', userPhoneNumber);

      // Call backend API to verify company ID and check if employee exists
      const response = await protectedFetch(
        `/employers/${companyId.trim()}/verify`,
        {
          method: 'POST',
          body: { phone: userPhoneNumber }
        },
        'tempToken'
      );

      console.log('Verification response:', response);

      if (response.success && response.data) {
        // Employee found in this company
        setEmployeeData({
          companyName: response.data.company_name,
          employeeName: response.data.employee_name || null,
          employerId: companyId.trim()
        });

        // Store employer ID for later use during profile setup
        await AsyncStorage.setItem('employerId', companyId.trim());
      } else {
        setNotFound(true);
      }
    } catch (error: any) {
      console.error('Error verifying company:', error);
      setNotFound(true);
      Alert.alert('Error', error.message || 'Failed to verify company ID');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!employeeData) return;

    // Navigate to profile setup with employee name pre-filled if available
    router.push({
      pathname: '/profile-setup',
      params: {
        employeeName: employeeData.employeeName || '',
        employerId: employeeData.employerId
      }
    });
  };

  return (
    <View className="flex-1 bg-background-dark">
      <View className="flex-1 px-4 pt-10 pb-6">
        {/* Header */}
        <View className="flex-row items-center pb-2">
          <BackButton />
          <View className="flex-1" />
        </View>

        {/* Progress */}
        <View className="w-full mb-8">
          <Text className="text-sm font-medium text-[#A9A9A9] mb-2">
            Step 2/4
          </Text>
          <View className="w-full h-1.5 rounded-full bg-[#A9A9A9]/30">
            <View className="w-1/2 h-1.5 bg-primary rounded-full" />
          </View>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold tracking-tight text-white leading-tight">
          Enter your Company ID
        </Text>
        <Text className="text-base font-normal text-[#A9A9A9] leading-normal pt-2 pb-8">
          Your employer will provide you with a Company ID. Paste it below to link your account.
        </Text>

        {/* Company ID Input */}
        <View className="flex flex-col gap-4">
          <View>
            <Text className="text-base font-medium text-white leading-normal pb-2">
              Company ID
            </Text>
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 rounded-lg border border-white/20 bg-transparent text-white h-14 px-4 text-base"
                placeholder="Paste Company ID here"
                placeholderTextColor="#A9A9A9"
                value={companyId}
                onChangeText={setCompanyId}
                autoCapitalize="none"
                onSubmitEditing={handleSearch}
              />
              <Pressable
                onPress={handleSearch}
                disabled={isLoading || !companyId.trim()}
                className="h-14 w-14 rounded-lg bg-primary items-center justify-center active:opacity-80 disabled:opacity-50"
              >
                {isLoading ? (
                  <ActivityIndicator color="#181711" />
                ) : (
                  <Ionicons name="search" size={24} color="#181711" />
                )}
              </Pressable>
            </View>
            <Text className="text-xs text-[#A9A9A9] mt-2">
              Example: a674d68b-0547-41d1-8fd4-89ddeb8d54c7
            </Text>
          </View>
        </View>

        {/* Employee Data Display */}
        {employeeData && !isLoading && (
          <View className="mt-8 flex flex-col rounded-xl bg-white/5 p-6 border border-white/10">
            <View className="flex-row items-center gap-3 mb-5">
              <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
              <Text className="text-xl font-bold text-white">
                Company Found!
              </Text>
            </View>
            <View className="flex flex-col mb-5">
              <Text className="text-sm font-medium text-[#A9A9A9] mb-2">
                Company
              </Text>
              <Text className="text-lg font-semibold text-white">
                {employeeData.companyName}
              </Text>
            </View>
            {employeeData.employeeName && (
              <View className="flex flex-col">
                <Text className="text-sm font-medium text-[#A9A9A9] mb-2">
                  Registered Name
                </Text>
                <Text className="text-lg font-semibold text-white">
                  {employeeData.employeeName}
                </Text>
                <Text className="text-xs text-[#A9A9A9] mt-1">
                  You can update your name in the next step
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Not Found Message */}
        {notFound && !isLoading && (
          <View className="mt-8 flex flex-col rounded-xl bg-red-500/10 p-6 border border-red-500/30">
            <View className="flex-row items-center gap-3 mb-3">
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
              <Text className="text-lg font-semibold text-red-400">
                Not Found
              </Text>
            </View>
            <Text className="text-sm text-red-300 leading-relaxed">
              We couldn't find you in this company. Please check your Company ID or ask your employer to add you first in the employer portal.
            </Text>
          </View>
        )}

        {/* Spacer */}
        <View className="flex-1" />

        {/* Confirm Button */}
        <View className="py-6">
          <Pressable
            onPress={handleConfirm}
            disabled={!employeeData}
            className="flex w-full items-center justify-center rounded-lg bg-primary h-14 active:opacity-80 disabled:opacity-50"
          >
            <Text className="text-base font-bold text-background-dark">
              Confirm &amp; Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
