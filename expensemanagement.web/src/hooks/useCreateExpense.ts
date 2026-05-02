import {  createExpenseApi } from "@/api/expense";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useCreateExpense() {
    const queryClient = useQueryClient();

    const { mutate: createExpense,isPending } = useMutation({
        mutationFn: createExpenseApi,
        onSuccess: () => {
            toast.success('Expense created successfully');
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    onError: (error: any) => {
        toast.error(error.response.data.message || 'Something went wrong');
    }
    });

    return { createExpense, isPending };
}