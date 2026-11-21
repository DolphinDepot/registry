export interface SourceConfig {
    source: {
        type: string;
        repository?: string;
    };
}

export interface License {
    spdx: string;
    url?: string;
    notes?: string;
}

export interface ExternalResource {
    type: "download" | "assets";
    label: string;
    url: string;
    notes?: string;
}

export interface BootFile {
    source: string;
    targets: ("ipl.dol" | "autoexec.dol" | "boot.dol" | "boot2.dol")[];
}

export interface Manifest {
    name: string;
    author: string;
    description_short: string;
    description_long?: string;
    category: string;
    platforms?: string[];
    peripherals?: string[];
    license: License;
    source?:
        | { type: "github_release"; repository: string; asset_pattern: string }
        | { type: "direct_url"; url: string; file_name?: string };
    external_resources?: ExternalResource[];
    boot_files?: BootFile[];
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
