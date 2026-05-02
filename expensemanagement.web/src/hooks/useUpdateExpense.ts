import { updateExpenseApi } from "@/api/expense";
import type { CreateExpense } from "@/Types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  const { mutate: updateExpense, isPending } = useMutation({
    mutationFn: ({id, data,}: {
      id: number;
      data: CreateExpense;
    }) => updateExpenseApi(id, data),

    onSuccess: () => {
      toast.success("Expense updated successfully");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  return { updateExpense, isPending };
};