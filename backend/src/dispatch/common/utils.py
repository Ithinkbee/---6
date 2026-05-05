from math import ceil

from pydantic import BaseModel


class PaginationParams(BaseModel):
    offset: int = 0
    limit: int = 20


class PaginatedResponse(BaseModel):
    items: list
    total: int
    offset: int
    limit: int
    pages: int

    @classmethod
    def create(cls, items: list, total: int, offset: int, limit: int):
        return cls(
            items=items,
            total=total,
            offset=offset,
            limit=limit,
            pages=ceil(total / limit) if limit > 0 else 0,
        )
