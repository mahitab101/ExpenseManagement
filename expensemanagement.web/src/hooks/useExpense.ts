import { getExpenseApi } from "@/api/expense";
import type { ApiResponse, Expense } from "@/Types";
import { useQuery } from "@tanstack/react-query";

export function useExpense() {
  const {
    data: expenses,
    isPending,
    error,
  } = useQuery<ApiResponse<Expense[]>, Error, Expense[]>({
    queryKey: ["expenses"],
    queryFn: getExpenseApi,
    select: (res) => res.data, // select the data from the response
    
  });

  return { expenses, isPending, error };
}
