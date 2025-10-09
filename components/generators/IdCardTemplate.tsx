import React from 'react';
import { Student, OwnerProfile } from '../../types';

interface IdCardTemplateProps {
    student: Student;
    school: OwnerProfile;
}

// A simple fallback for the school logo
const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NmZDNkZCI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0tMS0xNGgydjZoLTJWM2gxdi0yaC0ydi0xaDJ2LTFoLTJ2LTFoMnYtMWgtMnYtMWgydi0xaC0ydjJoLTF2LTJoLTF2Mkg5djJoMXYtMmgydjJoMXYtMmgxdi0yaDF2MmgxVjZIMTB2MWgxdjFoMVY4aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMXYtMmgydjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMXYtMmgydjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aCg==</path></svg>";

export const IdCardTemplate: React.FC<IdCardTemplateProps> = ({ student, school }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || defaultLogo;

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <img src={schoolLogo} alt="School Logo" style={styles.logo} crossOrigin="anonymous"/>
                <div style={styles.schoolInfo}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                </div>
            </div>
            <div style={styles.content}>
                <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                <h2 style={styles.studentName}>{student.name}</h2>
                <div style={styles.detailsGrid}>
                    <DetailRow label="Father's Name" value={student.father_name} />
                    <DetailRow label="Class" value={student.class} />
                    <DetailRow label="Roll No" value={student.roll_number} />
                    <DetailRow label="Mobile" value={student.mobile} />
                    <DetailRow label="Address" value={student.address} />
                </div>
            </div>
            <div style={styles.footer}>
                <p style={styles.footerText}>Student Identity Card</p>
            </div>
        </div>
    );
};

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <>
        <p style={styles.detailLabel}>{label}</p>
        <p style={styles.detailValue}>: {value || 'N/A'}</p>
    </>
);


// Using inline styles for direct inclusion in PDF generation
const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '85.6mm',
        height: '53.98mm',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
    },
    header: {
        backgroundColor: '#4f46e5',
        color: 'white',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
    },
    logo: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        marginRight: '8px',
        objectFit: 'cover',
    },
    schoolInfo: {
        lineHeight: '1.2',
    },
    schoolName: {
        fontSize: '10px',
        fontWeight: 'bold',
        margin: 0,
    },
    schoolAddress: {
        fontSize: '7px',
        margin: 0,
    },
    content: {
        padding: '6px',
        textAlign: 'center',
        flexGrow: 1,
        position: 'relative',
    },
    studentPhoto: {
        width: '50px',
        height: '50px',
        borderRadius: '6px',
        border: '2px solid #4f46e5',
        objectFit: 'cover',
        margin: '0 auto 4px auto',
        display: 'block',
    },
    studentName: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#333',
        margin: '0 0 5px 0',
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '1px 5px',
        textAlign: 'left',
        fontSize: '8px',
    },
    detailLabel: {
        fontWeight: 'bold',
        color: '#555',
        margin: 0,
    },
    detailValue: {
        color: '#333',
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    footer: {
        backgroundColor: '#4f46e5',
        color: 'white',
        textAlign: 'center',
        padding: '2px',
        fontSize: '7px',
        fontWeight: 'bold',
    },
    footerText: {
        margin: 0,
    }
};

export default IdCardTemplate;
