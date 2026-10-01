import Link from 'next/link';
import { Github, Twitter, Disc, ExternalLink } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-gray-950 border-t border-gray-800 mt-20 pt-10 pb-6">
            <div className="container mx-auto px-4">

                {/* TOP SECTION: Links & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

                    {/* Column 1: Brand & Contact */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Runic Library</h3>
                        <p className="text-sm text-gray-400">
                            The modern deck builder and collection manager for Riftbound.
                        </p>
                        <div className="text-sm text-gray-400">
                            <p className="font-semibold text-gray-300 mb-1">Contact:</p>
                            <a
                                href="mailto:stuckinstonemedia@gmail.com"
                                className="hover:text-cyan-400 transition-colors"
                            >
                                stuckinstonemedia@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Project */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-200">Project</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
                            </li>
                            <li>
                                <a
                                    href="https://developer.riotgames.com/apis/status"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors flex items-center gap-1"
                                >
                                    Riot API Status <ExternalLink className="h-3 w-3" />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Legal (Impressum & Policies) */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-200">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link href="/legal/impressum" className="hover:text-white transition-colors">
                                    Impressum / Legal Notice
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/privacy" className="hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/terms" className="hover:text-white transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Socials */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-200">Community</h4>
                        <div className="flex space-x-4">
                            <a
                                href="https://discord.gg/placeholder"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#5865F2] transition-colors"
                                aria-label="Join our Discord"
                            >
                                <Disc className="h-6 w-6" />
                            </a>
                            <a
                                href="https://twitter.com/placeholder"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#1DA1F2] transition-colors"
                                aria-label="Follow us on X (Twitter)"
                            >
                                <Twitter className="h-6 w-6" />
                            </a>
                            <a
                                href="https://github.com/merlinsleeps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="View source on GitHub"
                            >
                                <Github className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* SEPARATOR */}
                <div className="border-t border-gray-800 my-8" />

                {/* BOTTOM SECTION: Mandatory Riot Disclaimer */}
                <div className="text-xs text-gray-500 text-center space-y-4 max-w-4xl mx-auto">
                    <p>
                        Runic Library isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
                    </p>
                    <p>
                        &copy; {currentYear} Stuck In Stone Media. All Rights Reserved.
                    </p>
                </div>

            </div>
        </footer>
    );
}