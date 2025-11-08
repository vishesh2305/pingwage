import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities for human-centered interactions
 */

// Light tap - for subtle interactions like tapping a list item or button
export const lightTap = () => {
  Haptics.selectionAsync();
};

// Medium impact - for completing actions like filling a form
export const mediumImpact = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

// Heavy impact - for important actions like confirming a transaction
export const heavyImpact = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

// Success - for positive confirmations
export const success = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Warning - for cautionary actions
export const warning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

// Error - for errors or failed actions
export const error = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

// Tab switch - very subtle for navigation
export const tabSwitch = () => {
  Haptics.selectionAsync();
};

// Satisfying double tap - for important confirmations (like "Get Paid Now")
export const doubleTap = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, 50);
};

// Refresh haptic - for pull-to-refresh completion
export const refresh = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};
