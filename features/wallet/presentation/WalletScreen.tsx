import React from "react";
import { KeyboardAvoidingView, Linking, Platform, RefreshControl, ScrollView, Share } from "react-native";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { shortenAddress } from "../domain/address";
import { BalanceCard } from "./BalanceCard";
import { useWalletViewModel } from "./useWalletViewModel";

/** A well-known public address, handy for trying the app. */
const SAMPLE_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

export function WalletScreen() {
  const vm = useWalletViewModel();
  const loading = vm.status === "loading";

  if (!vm.address) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background-0">
        <VStack space="lg" className="flex-1 justify-center px-6">
          <Heading size="2xl">Watch a wallet</Heading>
          <Text className="text-typography-500">
            Paste any Ethereum address to see its balances on {vm.network.name}. Read-only: no private keys are ever
            requested or stored.
          </Text>
          <Input isInvalid={Boolean(vm.inputError)}>
            <InputField
              testID="address-input"
              placeholder="0x…"
              value={vm.input}
              onChangeText={vm.setInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Input>
          {vm.inputError ? <Text className="text-error-600">{vm.inputError}</Text> : null}
          <Button onPress={() => vm.watch()}>
            <ButtonText>Watch address</ButtonText>
          </Button>
          <Button variant="link" onPress={() => vm.watch(SAMPLE_ADDRESS)}>
            <ButtonText>Try a sample address</ButtonText>
          </Button>
        </VStack>
      </KeyboardAvoidingView>
    );
  }

  const { portfolio } = vm;

  return (
    <ScrollView
      className="flex-1 bg-background-0"
      contentContainerClassName="px-6 pb-10 pt-16"
      refreshControl={<RefreshControl refreshing={loading && Boolean(portfolio)} onRefresh={vm.refresh} />}
    >
      <VStack space="lg">
        <VStack space="xs">
          <Text size="sm" className="text-typography-500">
            {vm.network.name} testnet
          </Text>
          <Heading size="xl">{shortenAddress(vm.address)}</Heading>
        </VStack>

        <HStack space="sm">
          <Button size="sm" variant="outline" onPress={() => Share.share({ message: vm.address! })}>
            <ButtonText>Share</ButtonText>
          </Button>
          <Button size="sm" variant="outline" onPress={() => vm.explorerUrl && Linking.openURL(vm.explorerUrl)}>
            <ButtonText>Explorer</ButtonText>
          </Button>
          <Button size="sm" action="negative" variant="outline" onPress={vm.disconnect}>
            <ButtonText>Disconnect</ButtonText>
          </Button>
        </HStack>

        {vm.status === "error" ? (
          <VStack space="sm">
            <Text className="text-error-600">{vm.error}</Text>
            <Button onPress={vm.refresh}>
              <ButtonText>Retry</ButtonText>
            </Button>
          </VStack>
        ) : (
          <VStack space="md">
            <BalanceCard balance={portfolio?.native} loading={loading} />
            {(portfolio?.tokens ?? vm.network.tokens.map(() => undefined)).map((b, i) => (
              <BalanceCard key={b?.symbol ?? i} balance={b} loading={loading} />
            ))}
          </VStack>
        )}

        {loading && !portfolio ? <ButtonSpinner /> : null}
        {portfolio ? (
          <Text size="xs" className="text-typography-400">
            Updated {new Date(portfolio.fetchedAt).toLocaleTimeString()}. Pull down to refresh.
          </Text>
        ) : null}
      </VStack>
    </ScrollView>
  );
}
