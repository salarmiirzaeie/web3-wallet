import React from "react";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { Balance } from "../domain/types";

export function BalanceCard({ balance, loading }: { balance?: Balance; loading: boolean }) {
  return (
    <Card variant="outline" className="rounded-xl p-4">
      <HStack className="items-center justify-between">
        <VStack>
          <Text className="text-lg font-semibold">{balance?.symbol ?? " "}</Text>
          <Text size="sm" className="text-typography-500">
            {balance?.name ?? " "}
          </Text>
        </VStack>
        {loading && !balance ? (
          <Skeleton className="h-6 w-24 rounded" />
        ) : balance?.status === "ok" ? (
          <Text className="text-xl font-bold" testID={`balance-${balance.symbol}`}>
            {balance.formatted}
          </Text>
        ) : (
          <Text size="sm" className="text-error-600">
            {balance?.status === "error" ? balance.error : ""}
          </Text>
        )}
      </HStack>
    </Card>
  );
}
