// OnePay SDK types
export {};

declare global {
  /**
   * Shape of the object expected by the OnePay SDK.
   */
  interface OnePayData {
    appid: string;
    hashToken: string;
    apptoken: string;
    transactionRedirectUrl: string;
    additionalData?: string;
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

  interface Window {
    /** populated immediately before calling `onPayButtonClicked` */
    onePayData: OnePayData;
    /** injected by https://storage.googleapis.com/onepayjs/onepayv2.js */
    onPayButtonClicked: () => void;
  }

  /** Fallback global for libraries that attach the function directly to the JS scope */
  var onPayButtonClicked: () => void;
}
