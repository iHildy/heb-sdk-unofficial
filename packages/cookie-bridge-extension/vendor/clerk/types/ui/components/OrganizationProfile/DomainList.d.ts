import type { GetDomainsParams, OrganizationDomainVerificationStatus, OrganizationEnrollmentMode } from '@clerk/shared/types';
import React from 'react';
type DomainListProps = GetDomainsParams & {
    verificationStatus?: OrganizationDomainVerificationStatus;
    enrollmentMode?: OrganizationEnrollmentMode;
    fallback?: React.ReactNode;
};
export declare const DomainList: React.ComponentType<DomainListProps>;
export {};
