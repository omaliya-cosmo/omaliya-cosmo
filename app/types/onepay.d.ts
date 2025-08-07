// OnePay types definition
export {};

declare global {
  /**
   * Shape of the object expected by the OnePay SDK.
   * Extend as new fields become mandatory.
   */
  interface OnePayData {
    appid: string;
    hashToken: string;
    apptoken: string;
    transactionRedirectUrl: string;
    additional_data?: string;
    amount: number;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhoneNumber: string;
    orderReference: string;
    currency: string;
    // add any other optional keys here
    [key: string]: unknown;
  }

  interface OnePayResult {
    code: "201" | "400";
    transaction_id: string;
    status: "SUCCESS" | "FAIL";
  }

  type OnePayEvent = CustomEvent<OnePayResult>;

  interface Window {
    /** populated immediately before calling `onPayButtonClicked` */
    onePayData: OnePayData;
    openPaymentIframe: (url: string, id: string) => void;
    /** injected by https://storage.googleapis.com/onepayjs/onepayv2.js */
    onPayButtonClicked: () => void;
    /** Event listeners for OnePay */
    addEventListener(
      type: "onePaySuccess",
      listener: (event: OnePayEvent) => void
    ): void;
    addEventListener(
      type: "onePayFail",
      listener: (event: OnePayEvent) => void
    ): void;
    removeEventListener(
      type: "onePaySuccess",
      listener: (event: OnePayEvent) => void
    ): void;
    removeEventListener(
      type: "onePayFail",
      listener: (event: OnePayEvent) => void
    ): void;
  }

  /** Fallback global for libraries that attach the function directly to the JS scope */
  var onPayButtonClicked: () => void;
}
