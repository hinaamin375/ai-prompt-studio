"""
Shared prompt-template syntax definitions.

Parser and renderer components use the same compiled pattern so that
placeholder discovery and placeholder replacement remain consistent.
"""

import re

VARIABLE_NAME_PATTERN = r"[A-Za-z_][A-Za-z0-9_]*"

VARIABLE_PATTERN = re.compile(rf"\{{\{{(?P<name>{VARIABLE_NAME_PATTERN})\}}\}}")
