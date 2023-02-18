import { useCallback, useEffect, useState } from "react";

export const getFormatOptions = (value: number, isUsd = false) => {
  const formatOptions: Intl.NumberFormatOptions = {};

  if (isUsd) {
    formatOptions.minimumFractionDigits = 2;
    formatOptions.maximumFractionDigits = 2;
  } else {
    formatOptions.maximumSignificantDigits = value < 1 ? 8 : 6;
  }

  return formatOptions;
};

export const formatNumber = (value: number) =>
  value.toLocaleString("en-US", getFormatOptions(value));

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export const useNumberInput = ({ value, onChange }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const parsedValue = Number.isNaN(parseFloat(inputValue))
    ? 0
    : parseFloat(inputValue);

  useEffect(() => {
    setInputValue(value ? formatNumber(value).replace(/,/g, "") : "");
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let periodMatches = 0;
      let nextInputValue = e.target.value
        .replace(/,/g, ".") // Replace commas with periods
        .replace(/[^0-9.]/g, "") // Replace all non-numeric and non-period characters
        .replace(/\./g, (match) => (++periodMatches > 1 ? "" : match)); // Replace all periods after the first one

      let numberValue = parseFloat(nextInputValue);
      console.log(nextInputValue);
      if (Number.isNaN(numberValue)) {
        numberValue = 0;
        nextInputValue = "";
      }

      setInputValue(nextInputValue);
      onChange(numberValue);
    },
    [onChange]
  );

  return {
    inputValue,
    parsedValue,
    handleChange,
  };
};
