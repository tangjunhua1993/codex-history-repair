import type { ProviderForm } from "../types";

export const emptyProviderForm: ProviderForm = {
  ccSwitchDir: "",
  jsonText: "",
  providerId: "",
  providerName: "",
};

export function providerArgs(form: ProviderForm) {
  return {
    ccSwitchDir: blankToNull(form.ccSwitchDir),
    providerId: blankToNull(form.providerId),
    providerName: blankToNull(form.providerName),
    baseUrl: null,
    apiKey: null,
    apiFormat: null,
    model: null,
    jsonText: blankToNull(form.jsonText),
  };
}

function blankToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
