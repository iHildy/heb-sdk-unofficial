declare const warnings: {
    cannotRenderComponentWhenSessionExists: string;
    cannotRenderSignUpComponentWhenSessionExists: string;
    cannotRenderSignUpComponentWhenTaskExists: string;
    cannotRenderComponentWhenTaskDoesNotExist: string;
    cannotRenderSignInComponentWhenSessionExists: string;
    cannotRenderSignInComponentWhenTaskExists: string;
    cannotRenderComponentWhenUserDoesNotExist: string;
    cannotRenderComponentWhenOrgDoesNotExist: string;
    cannotRenderAnyOrganizationComponent: (componentName: "OrganizationProfile" | "OrganizationSwitcher" | "OrganizationList" | "CreateOrganization" | "TaskChooseOrganization") => string;
    cannotRenderAnyBillingComponent: (componentName: "PricingTable" | "Checkout" | "PlanDetails") => string;
    cannotOpenUserProfile: string;
    cannotOpenCheckout: string;
    cannotOpenSignInOrSignUp: string;
    cannotRenderAPIKeysComponent: string;
    cannotRenderAPIKeysComponentForUserWhenDisabled: string;
    cannotRenderAPIKeysComponentForOrgWhenDisabled: string;
};
export { warnings };
