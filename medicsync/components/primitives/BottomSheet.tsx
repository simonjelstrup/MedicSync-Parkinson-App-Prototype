import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import GorhomBottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { colors, radii, spacing, typography } from '../../lib/theme';

export interface BottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface BottomSheetProps {
  snapPoints: (string | number)[];
  children: React.ReactNode;
  title?: string;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ snapPoints, children, title }, ref) => {
    const internalRef = useRef<GorhomBottomSheet>(null);

    useImperativeHandle(ref, () => ({
      present: () => internalRef.current?.snapToIndex(0),
      dismiss: () => internalRef.current?.close(),
    }));

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <GorhomBottomSheet
        ref={internalRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.background}
      >
        <BottomSheetView style={styles.content}>
          {title && (
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          {children}
        </BottomSheetView>
      </GorhomBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  handle: {
    backgroundColor: colors.borderStrong,
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  background: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  content: {
    paddingHorizontal: spacing.screenEdge,
    paddingBottom: 40,
  },
  titleRow: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  title: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },
});
