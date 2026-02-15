export interface SourceConfig {
  source: {
    type: string;
    repository: string;
  };
}

export interface Manifest {
  name: string;
  maintainer: string;
  authors?: string[];
  description_short: string;
  description_long?: string;
  category: string;
  platforms?: string[];
  peripherals?: string[];
  source: {
    type: string;
    asset_pattern: string;
  };
  treatments: {
    treatment: string;
    arguments: string[];
  }[];
}

export interface CheckResult {
  check: string;
  passed: boolean;
  message: string;
}

export interface CheckContext {
  slug: string;
  dir: string;
  sourceConfig?: SourceConfig;
  repoOwner?: string;
  repoName?: string;
  defaultBranch?: string;
  manifest?: Manifest;
  allSlugs: string[];
}
