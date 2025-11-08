import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';

// Sample data for testing
const SAMPLE_DATA = [
  {
    companyId: 'PING-78901',
    companyName: 'Innovate Corp.',
    employees: [
      { phone: '+41791234567', name: 'Alex Johnson' },
      { phone: '+41797654321', name: 'Sarah Williams' },
    ],
  },
  {
    companyId: 'PING-12345',
    companyName: 'TechStart Inc.',
    employees: [
      { phone: '+41791111111', name: 'John Doe' },
      { phone: '+41792222222', name: 'Jane Smith' },
    ],
  },
];

export default function CompanyVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [companyId, setCompanyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<{
    companyName: string;
    employeeName: string;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Get phone number from navigation params, fallback to test number
  const userPhoneNumber = (params.phoneNumber as string) || '+41791234567';

  const handleSearch = async () => {
    if (!companyId.trim()) return;

    setIsLoading(true);
    setNotFound(false);
    setEmployeeData(null);

    // Simulate API call with delay
    setTimeout(() => {
      // Search for company
      const company = SAMPLE_DATA.find(
        (c) => c.companyId.toLowerCase() === companyId.trim().toLowerCase()
      );

      if (company) {
        // Search for employee by phone number
        const employee = company.employees.find(
          (e) => e.phone === userPhoneNumber
        );

        if (employee) {
          setEmployeeData({
            companyName: company.companyName,
            employeeName: employee.name,
          });
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }

      setIsLoading(false);
    }, 1500); // 1.5 second delay to simulate network request
  };

  const handleConfirm = () => {
    if (!employeeData) return;

    // Navigate to profile setup with employee name
    router.push({
      pathname: '/profile-setup',
      params: { employeeName: employeeData.employeeName }
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
          You can find this ID in the welcome email from your employer.
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
                placeholder="e.g., PING-12345"
                placeholderTextColor="#A9A9A9"
                value={companyId}
                onChangeText={setCompanyId}
                autoCapitalize="characters"
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
          </View>
        </View>

        {/* Employee Data Display */}
        {employeeData && !isLoading && (
          <View className="mt-8 flex flex-col rounded-xl bg-white/5 p-6 border border-white/10">
            <View className="flex flex-col mb-5">
              <Text className="text-sm font-medium text-[#A9A9A9] mb-2">
                Company
              </Text>
              <Text className="text-lg font-semibold text-white">
                {employeeData.companyName}
              </Text>
            </View>
            <View className="flex flex-col">
              <Text className="text-sm font-medium text-[#A9A9A9] mb-2">
                Employee Name
              </Text>
              <Text className="text-lg font-semibold text-white">
                {employeeData.employeeName}
              </Text>
            </View>
          </View>
        )}

        {/* Not Found Message */}
        {notFound && !isLoading && (
          <View className="mt-8 flex flex-col rounded-xl bg-red-500/10 p-6 border border-red-500/30">
            <View className="flex-row items-center gap-3 mb-3">
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
              <Text className="text-lg font-semibold text-red-400">
                Employee Not Found
              </Text>
            </View>
            <Text className="text-sm text-red-300 leading-relaxed">
              We couldn't find you in this company. Please check your Company ID or contact your employer for assistance.
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
