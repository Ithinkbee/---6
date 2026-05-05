from enum import StrEnum


class Genre(StrEnum):
    ROCK = "rock"
    POP = "pop"
    JAZZ = "jazz"
    CLASSICAL = "classical"
    HIP_HOP = "hip_hop"
    ELECTRONIC = "electronic"
    FOLK = "folk"
    RNB = "rnb"
    METAL = "metal"
    INDIE = "indie"
    OTHER = "other"


class Mood(StrEnum):
    HAPPY = "happy"
    SAD = "sad"
    ENERGETIC = "energetic"
    CALM = "calm"
    ROMANTIC = "romantic"
    AGGRESSIVE = "aggressive"
